import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  PencilIcon,
  TrashIcon,
  PlusIcon,
  ArrowPathIcon,
  MagnifyingGlassIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  EyeIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const CourseManagement = () => {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const queryClient = useQueryClient();

  const { data, isLoading, error } = useQuery({
    queryKey: ['admin-courses', page, search, status],
    queryFn: async () => {
      const response = await api.get('/admin/courses', {
        params: { page, limit: 9, search, status }
      });
      return response.data;
    },
    retry: 1
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.delete(`/admin/courses/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  });

  const recoverCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.post(`/admin/courses/${courseId}/recover`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      toast.success('Course recovered successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to recover course');
    }
  });

  const featureCourseMutation = useMutation({
    mutationFn: async ({ courseId, feature }) => {
      const endpoint = feature ? 'feature' : 'unfeature';
      const response = await api.post(`/admin/courses/${courseId}/${endpoint}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['admin-courses']);
      toast.success('Course status updated');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update course');
    }
  });

  if (error) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">⚠️</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          Failed to load courses
        </h2>
        <p className="text-gray-500 dark:text-gray-400">
          Please try refreshing the page or contact support.
        </p>
        <button
          onClick={() => queryClient.invalidateQueries(['admin-courses'])}
          className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Course Management</h1>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Course
        </button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="w-full px-4 py-2 pl-10 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-gray-700 dark:text-white"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-gray-400 absolute left-3 top-2.5" />
        </div>
        <select
          value={status}
          onChange={(e) => {
            setStatus(e.target.value);
            setPage(1);
          }}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Courses</option>
          <option value="active">Active</option>
          <option value="deleted">Deleted</option>
        </select>
      </div>

      {/* Courses Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <div key={i} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden animate-pulse">
              <div className="h-48 bg-gray-200 dark:bg-gray-700"></div>
              <div className="p-4 space-y-3">
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-full"></div>
                <div className="h-3 bg-gray-200 dark:bg-gray-700 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      ) : data?.data?.length === 0 ? (
        <div className="text-center py-12">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No courses found
          </h2>
          <p className="text-gray-500 dark:text-gray-400">
            {search ? 'Try adjusting your search' : 'Create your first course'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {data?.data?.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-white opacity-50">
                    {course.title?.[0]?.toUpperCase()}
                  </span>
                )}
                {course.isDeleted && (
                  <div className="absolute top-2 right-2 bg-red-500 text-white px-2 py-1 rounded-lg text-xs font-semibold">
                    Deleted
                  </div>
                )}
                {course.featured && (
                  <div className="absolute top-2 left-2 bg-yellow-500 text-white px-2 py-1 rounded-lg text-xs font-semibold flex items-center gap-1">
                    <StarIcon className="h-3 w-3" />
                    Featured
                  </div>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-500 dark:text-gray-400 mb-2">
                  Instructor: {course.instructor}
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    {course._count?.enrolled || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" />
                    {course._count?.modules || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {course._count?.assignments || 0}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => window.location.href = `/courses/${course.id}`}
                    className="flex-1 px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                    View
                  </button>
                  <button
                    onClick={() => featureCourseMutation.mutate({ 
                      courseId: course.id, 
                      feature: !course.featured 
                    })}
                    className={`px-3 py-1.5 rounded-lg text-sm ${
                      course.featured 
                        ? 'bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300'
                        : 'bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300'
                    }`}
                  >
                    {course.featured ? '★' : '☆'}
                  </button>
                  {course.isDeleted ? (
                    <button
                      onClick={() => recoverCourseMutation.mutate(course.id)}
                      className="px-3 py-1.5 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg hover:bg-green-200 dark:hover:bg-green-800"
                      title="Recover course"
                    >
                      <ArrowPathIcon className="h-4 w-4" />
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        if (window.confirm(`Are you sure you want to delete "${course.title}"?`)) {
                          deleteCourseMutation.mutate(course.id);
                        }
                      }}
                      className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                      title="Delete course"
                    >
                      <TrashIcon className="h-4 w-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {data?.pagination && (
        <div className="flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
            {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
            {data.pagination.total} courses
          </p>
          <div className="flex gap-2">
            <button
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronLeftIcon className="h-5 w-5" />
            </button>
            <span className="px-3 py-1 text-sm text-gray-700 dark:text-gray-300">
              Page {page} of {data.pagination.pages}
            </span>
            <button
              onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
              disabled={page === data.pagination.pages}
              className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-gray-50 dark:hover:bg-gray-700"
            >
              <ChevronRightIcon className="h-5 w-5" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseManagement;