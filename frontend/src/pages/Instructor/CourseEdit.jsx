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
  DocumentTextIcon
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
  const [moduleData, setModuleData] = useState({
    title: '',
    content: '',
    order: 0,
    videoUrl: ''
  });

  const { data: course, isLoading } = useQuery({
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

  const createModuleMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/instructor/courses/${id}/modules`, data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Module created successfully');
      setShowModuleForm(false);
      setModuleData({ title: '', content: '', order: 0, videoUrl: '' });
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create module');
    }
  });

  const deleteModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      const response = await api.delete(`/instructor/modules/${moduleId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-course', id]);
      toast.success('Module deleted successfully');
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
    createModuleMutation.mutate(moduleData);
  };

  const handleDeleteModule = (moduleId, moduleTitle) => {
    if (window.confirm(`Are you sure you want to delete module "${moduleTitle}"?`)) {
      deleteModuleMutation.mutate(moduleId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
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

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/instructor/courses')}
        className="inline-flex items-center text-blue-600 hover:underline"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to Courses
      </button>

      {/* Course Details */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-6">
          Edit Course: {course.title}
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Course Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                Category
              </label>
              <select
                value={formData.category}
                onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              >
                <option value="">Select a category</option>
                <option value="web-development">Web Development</option>
                <option value="data-science">Data Science</option>
                <option value="mobile-development">Mobile Development</option>
                <option value="design">Design</option>
                <option value="business">Business</option>
                <option value="marketing">Marketing</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Course Description *
            </label>
            <textarea
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
              Thumbnail URL
            </label>
            <input
              type="url"
              value={formData.thumbnail}
              onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
              placeholder="https://example.com/image.jpg"
            />
          </div>

          <div className="flex gap-4 pt-4 border-t border-gray-200 dark:border-gray-700">
            <button
              type="submit"
              disabled={updateCourseMutation.isPending}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {updateCourseMutation.isPending ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>

      {/* Course Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <UserGroupIcon className="h-8 w-8 text-blue-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.enrolled?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-green-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Modules</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.modules?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-4">
          <div className="flex items-center gap-3">
            <DocumentTextIcon className="h-8 w-8 text-purple-500" />
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Assignments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {course.assignments?.length || 0}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Modules Section */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl font-bold text-gray-900 dark:text-white">Course Modules</h2>
          <button
            onClick={() => setShowModuleForm(!showModuleForm)}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
          >
            <PlusIcon className="h-5 w-5" />
            Add Module
          </button>
        </div>

        {showModuleForm && (
          <form onSubmit={handleModuleSubmit} className="mb-6 p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
              Create New Module
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Module Title *
                </label>
                <input
                  type="text"
                  value={moduleData.title}
                  onChange={(e) => setModuleData({ ...moduleData, title: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Content *
                </label>
                <textarea
                  value={moduleData.content}
                  onChange={(e) => setModuleData({ ...moduleData, content: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Video URL
                </label>
                <input
                  type="url"
                  value={moduleData.videoUrl}
                  onChange={(e) => setModuleData({ ...moduleData, videoUrl: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                  placeholder="https://www.youtube.com/watch?v=..."
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                  Order
                </label>
                <input
                  type="number"
                  value={moduleData.order}
                  onChange={(e) => setModuleData({ ...moduleData, order: parseInt(e.target.value) || 0 })}
                  className="w-full px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-800 dark:text-white"
                />
              </div>
              <div className="flex gap-4">
                <button
                  type="submit"
                  disabled={createModuleMutation.isPending}
                  className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
                >
                  {createModuleMutation.isPending ? 'Creating...' : 'Create Module'}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowModuleForm(false);
                    setModuleData({ title: '', content: '', order: 0, videoUrl: '' });
                  }}
                  className="px-6 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </div>
          </form>
        )}

        {course.modules?.length === 0 ? (
          <p className="text-center text-gray-500 dark:text-gray-400 py-8">
            No modules yet. Add your first module to start building your course content.
          </p>
        ) : (
          <div className="space-y-3">
            {course.modules?.map((module, index) => (
              <div
                key={module.id}
                className="flex items-center justify-between p-4 bg-gray-50 dark:bg-gray-700 rounded-lg hover:shadow-md transition-shadow"
              >
                <div className="flex-1">
                  <div className="flex items-center gap-3">
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div>
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {module.title}
                      </h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {module.content}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      // Edit module functionality
                      toast.info('Edit feature coming soon');
                    }}
                    className="p-2 text-gray-500 hover:text-blue-600 transition-colors"
                  >
                    <PencilIcon className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDeleteModule(module.id, module.title)}
                    className="p-2 text-gray-500 hover:text-red-600 transition-colors"
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