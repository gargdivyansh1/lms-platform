import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useMutation } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  PlusIcon,
  CheckCircleIcon,
  XMarkIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  PhotoIcon,
  TagIcon,
  BookOpenIcon
} from '@heroicons/react/24/outline';

const InstructorCourseCreate = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    thumbnail: ''
  });
  const [touched, setTouched] = useState({
    title: false,
    description: false
  });

  const createCourseMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post('/instructor/courses', data);
      return response.data;
    },
    onSuccess: (data) => {
      toast.success('Course created successfully!');
      navigate(`/instructor/courses/${data.course.id}`);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create course');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    // Mark all fields as touched
    setTouched({ title: true, description: true });
    
    if (!formData.title || !formData.description) {
      toast.error('Please fill in all required fields');
      return;
    }
    createCourseMutation.mutate(formData);
  };

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    // Mark field as touched on change
    setTouched({
      ...touched,
      [e.target.name]: true
    });
  };

  const handleBlur = (e) => {
    setTouched({
      ...touched,
      [e.target.name]: true
    });
  };

  const isTitleValid = formData.title.length > 0;
  const isDescriptionValid = formData.description.length > 0;

  return (
    <div className="mx-auto space-y-6">

      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            Create New Course
          </h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">
            Share your knowledge with the world by creating a new course
          </p>
        </div>
        <div className="hidden md:block">
          <div className="flex items-center gap-2 text-sm text-slate-400">
            <span className="px-3 py-1 bg-slate-100 dark:bg-slate-700 rounded-full">
              Step 1 of 1
            </span>
          </div>
        </div>
      </div>

      {/* Main Form */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {/* Course Title */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Course Title <span className="text-red-500">*</span>
              </label>
              {touched.title && (
                <span className={`text-xs ${isTitleValid ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isTitleValid ? (
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      Valid
                    </span>
                  ) : (
                    'Required'
                  )}
                </span>
              )}
            </div>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              onBlur={handleBlur}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors ${
                touched.title && !isTitleValid
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="e.g., Mastering JavaScript: From Beginner to Advanced"
              required
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Choose a clear, descriptive title that attracts students
            </p>
          </div>

          {/* Course Description */}
          <div>
            <div className="flex items-center justify-between mb-1">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Course Description <span className="text-red-500">*</span>
              </label>
              {touched.description && (
                <span className={`text-xs ${isDescriptionValid ? 'text-emerald-600' : 'text-red-500'}`}>
                  {isDescriptionValid ? (
                    <span className="flex items-center gap-1">
                      <CheckCircleIcon className="h-3 w-3" />
                      Valid
                    </span>
                  ) : (
                    'Required'
                  )}
                </span>
              )}
            </div>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleChange}
              onBlur={handleBlur}
              rows={6}
              className={`w-full px-4 py-2.5 border rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors ${
                touched.description && !isDescriptionValid
                  ? 'border-red-300 dark:border-red-700'
                  : 'border-slate-300 dark:border-slate-600'
              }`}
              placeholder="Describe what students will learn in this course. Include learning objectives, prerequisites, and what makes your course unique."
              required
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Write a compelling description that highlights the value of your course
            </p>
          </div>

          {/* Category */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <TagIcon className="h-4 w-4" />
                Category
              </span>
            </label>
            <select
              name="category"
              value={formData.category}
              onChange={handleChange}
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
              <option value="ai-machine-learning">AI & Machine Learning</option>
              <option value="cybersecurity">Cybersecurity</option>
              <option value="other">Other</option>
            </select>
          </div>

          {/* Thumbnail */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
              <span className="flex items-center gap-1">
                <PhotoIcon className="h-4 w-4" />
                Thumbnail URL
              </span>
            </label>
            <input
              type="url"
              name="thumbnail"
              value={formData.thumbnail}
              onChange={handleChange}
              className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="https://example.com/thumbnail.jpg"
            />
            <p className="mt-1 text-xs text-slate-500 dark:text-slate-400">
              Add a cover image URL for your course (recommended size: 1280x720)
            </p>
          </div>

          {/* Form Actions */}
          <div className="flex flex-wrap gap-4 pt-6 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={createCourseMutation.isPending}
              className="flex-1 min-w-[150px] px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md flex items-center justify-center gap-2 font-medium"
            >
              {createCourseMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Creating...
                </>
              ) : (
                <>
                  <PlusIcon className="h-5 w-5" />
                  Create Course
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/instructor/courses')}
              className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default InstructorCourseCreate;