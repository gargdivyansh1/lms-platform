import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon
} from '@heroicons/react/24/outline';

const InstructorCourses = () => {
  const queryClient = useQueryClient();

  const { data: courses, isLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses');
      return response.data;
    },
    retry: 1
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.delete(`/instructor/courses/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      queryClient.invalidateQueries(['instructor-dashboard']);
      toast.success('Course deleted successfully');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  });

  const handleDelete = (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">My Courses</h1>
          <p className="text-gray-500 dark:text-gray-400">Manage all your courses from one place</p>
        </div>
        <Link
          to="/instructor/courses/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Course
        </Link>
      </div>

      {courses?.length === 0 ? (
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-lg">
          <div className="text-6xl mb-4">📚</div>
          <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
            No Courses Yet
          </h2>
          <p className="text-gray-500 dark:text-gray-400 mb-6">
            Start creating your first course and share your knowledge with students.
          </p>
          <Link
            to="/instructor/courses/create"
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
          >
            Create Course
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses?.map((course) => (
            <div key={course.id} className="bg-white dark:bg-gray-800 rounded-xl shadow-lg overflow-hidden hover:shadow-xl transition-shadow">
              <div className="relative h-48 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-white opacity-50">
                    {course.title?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div className="p-4">
                <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-1 line-clamp-1">
                  {course.title}
                </h3>
                <p className="text-sm text-gray-600 dark:text-gray-300 line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-gray-500 dark:text-gray-400 mb-3">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    {course._count?.enrolled || 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" />
                    {course._count?.modules || 0} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {course._count?.assignments || 0} assignments
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/instructor/courses/${course.id}`}
                    className="flex-1 px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-1 text-sm"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Manage
                  </Link>
                  <Link
                    to={`/courses/${course.id}`}
                    target="_blank"
                    className="px-3 py-1.5 bg-gray-100 dark:bg-gray-700 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-200 dark:hover:bg-gray-600 flex items-center justify-center gap-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="px-3 py-1.5 bg-red-100 dark:bg-red-900 text-red-700 dark:text-red-300 rounded-lg hover:bg-red-200 dark:hover:bg-red-800"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;