import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  PencilIcon,
  TrashIcon,
  UserGroupIcon,
  DocumentTextIcon,
  BookOpenIcon,
  PlayIcon,
  XMarkIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const InstructorCourseEdit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });
  const [showModuleForm, setShowModuleForm] = useState(false);
  const [editingModule, setEditingModule] = useState(null);
  const [moduleData, setModuleData] = useState({
    title: '',
    content: '',
    order: 0,
    videoUrl: ''
  });

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['instructor-course', id],
    queryFn: async () => {
      const response = await api.get(`/instructor/courses/${id}`);
      return response.data;
    },
    enabled: !!id
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || '',
        description: course.description || '',
        category: course.category || '',
        thumbnail: course.thumbnail || ''
      });
    }
  }, [course]);

  // Update Course
  const updateCourseMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.put(`/instructor/courses/${id}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Course updated successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update course');
    }
  });

  // Create Module
  const createModuleMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/instructor/courses/${id}/modules`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Module created successfully');
      setShowModuleForm(false);
      setEditingModule(null);
      setModuleData({ title: '', content: '', order: 0, videoUrl: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create module');
    }
  });

  // Update Module
  const updateModuleMutation = useMutation({
    mutationFn: async ({ moduleId, data }) => {
      const response = await api.put(`/instructor/modules/${moduleId}`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Module updated successfully');
      setShowModuleForm(false);
      setEditingModule(null);
      setModuleData({ title: '', content: '', order: 0, videoUrl: '' });
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update module');
    }
  });

  // Delete Module
  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      const response = await api.delete(`/instructor/modules/${moduleId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Module deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete module');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    updateCourseMutation.mutate(formData);
  };

  const handleModuleSubmit = (e) => {
    e.preventDefault();
    if (!moduleData.title || !moduleData.content) {
      toast.error('Please fill in module title and content');
      return;
    }

    if (editingModule) {
      updateModuleMutation.mutate({ moduleId: editingModule.id, data: moduleData });
    } else {
      createModuleMutation.mutate(moduleData);
    }
  };

  const handleEditModule = (module) => {
    setEditingModule(module);
    setModuleData({
      title: module.title || '',
      content: module.content || '',
      order: module.order || 0,
      videoUrl: module.videoUrl || ''
    });
    setShowModuleForm(true);
  };

  const handleDeleteModule = (moduleId, moduleTitle) => {
    if (window.confirm(`Are you sure you want to delete module "${moduleTitle}"?`)) {
      deleteModuleMutation.mutate(moduleId);
    }
  };

  const cancelModuleForm = () => {
    setShowModuleForm(false);
    setEditingModule(null);
    setModuleData({ title: '', content: '', order: 0, videoUrl: '' });
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Course not found
        </h2>
        <button
          onClick={() => navigate('/instructor/courses')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to courses
        </button>
      </div>
    );
  }

  const totalStudents = course.enrolled?.length || 0;
  const totalModules = course.modules?.length || 0;

  return (
    <div className="space-y-6">

      {/* Course Details */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              Edit Course
            </h1>
            <p className="text-slate-500 dark:text-slate-400">
              Update course information and content
            </p>
          </div>
          <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
            <ClockIcon className="h-4 w-4" />
            <span>Last updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              >
                <option value="">Select a category</option>
                <option value="web-development">Web Development</option>
                <option value="data-science">Data Science</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="cloud-computing">Cloud Computing</option>
                <option value="devops">DevOps</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Course Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="https://example.com/image.jpg"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add a cover image URL for your course
            </p>
          </div>

          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={updateCourseMutation.isPending}
              className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md flex items-center gap-2"
            >
              {updateCourseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                  Saving...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="h-5 w-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Students</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalStudents}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Modules</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {totalModules}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Assignments</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">
                {course.assignments?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              Course Modules
            </h2>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              {totalModules} modules in this course
            </p>
          </div>
          <button
            onClick={() => {
              setShowModuleForm(!showModuleForm);
              if (!showModuleForm) {
                setEditingModule(null);
                setModuleData({ title: '', content: '', order: totalModules + 1, videoUrl: '' });
              }
            }}
            className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Add Module
          </button>
        </div>

        {/* Module Form */}
        {showModuleForm && (
          <div className="mb-6 p-5 bg-slate-50 dark:bg-slate-700/50 rounded-xl border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-slate-900 dark:text-white">
                {editingModule ? 'Edit Module' : 'Create New Module'}
              </h3>
              <button
                onClick={cancelModuleForm}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleModuleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={moduleData.title}
                  onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-colors"
                  required
                  placeholder="Enter module title"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={moduleData.content}
                  onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-colors"
                  required
                  placeholder="Enter module content"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Video URL
                  </label>
                  <input
                    type="url"
                    value={moduleData.videoUrl}
                    onChange={(e) => setModuleData({ ...moduleData, videoUrl: e.target.value })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-colors"
                    placeholder="https://www.youtube.com/watch?v=..."
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                    Order
                  </label>
                  <input
                    type="number"
                    value={moduleData.order}
                    onChange={(e) => setModuleData({ ...moduleData, order: parseInt(e.target.value) || 0 })}
                    className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white transition-colors"
                    min="1"
                  />
                </div>
              </div>
              <div className="flex gap-4 pt-2">
                <button
                  type="submit"
                  disabled={createModuleMutation.isPending || updateModuleMutation.isPending}
                  className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md flex items-center gap-2"
                >
                  {(createModuleMutation.isPending || updateModuleMutation.isPending) ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      {editingModule ? 'Updating...' : 'Creating...'}
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      {editingModule ? 'Update Module' : 'Create Module'}
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={cancelModuleForm}
                  className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        )}

        {/* Modules List */}
        {course.modules?.length === 0 ? (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">📚</div>
            <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
              No Modules Yet
            </h3>
            <p className="text-slate-500 dark:text-slate-400">
              Add your first module to start building your course content.
            </p>
          </div>
        ) : (
          <div className="space-y-3">
            {course.modules?.map((module, index) => (
              <div
                key={module.id}
                className="flex flex-wrap items-center justify-between p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl hover:shadow-md transition-all border border-slate-200 dark:border-slate-700"
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-lg font-semibold text-sm flex-shrink-0">
                      {index + 1}
                    </span>
                    <div className="min-w-0">
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {module.title}
                      </h4>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        {module.content}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-2 mt-2 sm:mt-0">
                  {module.videoUrl && (
                    <span className="px-2 py-1 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-lg text-xs flex items-center gap-1">
                      <PlayIcon className="h-3 w-3" />
                      Video
                    </span>
                  )}
                  <button
                    onClick={() => handleEditModule(module)}
                    className="p-2 text-slate-400 hover:text-blue-600 transition-colors rounded-lg hover:bg-blue-50 dark:hover:bg-blue-900/20"
                    title="Edit module"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id, module.title)}
                    className="p-2 text-slate-400 hover:text-red-600 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                    title="Delete module"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorCourseEdit;