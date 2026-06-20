import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import { ArrowLeftIcon, BookOpenIcon, UserGroupIcon } from '@heroicons/react/24/outline';

const CourseDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user } = useAuth();
  const [enrolling, setEnrolling] = useState(false);

  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      if (!isAuthenticated) return null;
      const response = await api.get('/enrollments/my-courses');
      return response.data.find(e => e.courseId === id);
    },
    enabled: isAuthenticated,
  });

  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments/enroll', { courseId: id });
      toast.success('Successfully enrolled!');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
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
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white">Course not found</h2>
        <Link to="/courses" className="text-blue-600 hover:underline mt-4 inline-block">
          Back to courses
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto">
      <Link to="/courses" className="inline-flex items-center text-blue-600 hover:underline mb-6">
        <ArrowLeftIcon className="h-4 w-4 mr-1" />
        Back to courses
      </Link>

      <div className="card">
        <div className="relative">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-64 object-cover"
            />
          ) : (
            <div className="w-full h-64 bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center">
              <span className="text-white text-6xl font-bold">
                {course.title?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
        </div>

        <div className="p-6">
          <div className="flex justify-between items-start">
            <div>
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
                {course.title}
              </h1>
              <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                <span>Instructor: {course.instructor}</span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <UserGroupIcon className="h-4 w-4" />
                  {course._count?.enrolled || 0} students
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <BookOpenIcon className="h-4 w-4" />
                  {course.modules?.length || 0} modules
                </span>
              </div>
            </div>
            {!enrollment && (
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            )}
            {enrollment && (
              <span className="px-4 py-2 bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300 rounded-lg">
                Enrolled
              </span>
            )}
          </div>

          <div className="mt-6">
            <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-2">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300">{course.description}</p>
          </div>

          {course.modules && course.modules.length > 0 && (
            <div className="mt-8">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Course Modules
              </h2>
              <div className="space-y-3">
                {course.modules.map((module, index) => (
                  <div
                    key={module.id}
                    className="flex items-center p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
                  >
                    <span className="w-8 h-8 flex items-center justify-center bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 rounded-full font-semibold text-sm">
                      {index + 1}
                    </span>
                    <div className="ml-3 flex-1">
                      <h3 className="font-medium text-gray-900 dark:text-white">
                        {module.title}
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 line-clamp-1">
                        {module.content}
                      </p>
                    </div>
                    {enrollment && (
                      <Link
                        to={`/module/${module.id}`}
                        className="px-3 py-1 text-sm text-blue-600 dark:text-blue-400 hover:underline"
                      >
                        View
                      </Link>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;