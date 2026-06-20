import React from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { BookOpenIcon, ClockIcon } from '@heroicons/react/24/outline';
import ProgressBar from '../components/ProgressBar';

const MyCourses = () => {
  const { data: enrollments, isLoading } = useQuery({
    queryKey: ['my-courses'],
    queryFn: async () => {
      const response = await api.get('/enrollments/my-courses');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!enrollments || enrollments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">📚</div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          No Courses Enrolled Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400 mb-6">
          Start your learning journey by enrolling in a course.
        </p>
        <Link
          to="/courses"
          className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors inline-block"
        >
          Browse Courses
        </Link>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Courses
      </h1>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {enrollments.map((enrollment) => (
          <div key={enrollment.id} className="card hover:shadow-xl transition-shadow">
            <div className="p-6">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-1">
                    {enrollment.course.title}
                  </h3>
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                    Instructor: {enrollment.course.instructor}
                  </p>
                </div>
                <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                  enrollment.completed
                    ? 'bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300'
                    : 'bg-blue-100 dark:bg-blue-900 text-blue-700 dark:text-blue-300'
                }`}>
                  {enrollment.completed ? 'Completed' : 'In Progress'}
                </span>
              </div>
              
              <div className="mt-4">
                <div className="flex justify-between text-sm text-gray-600 dark:text-gray-400 mb-1">
                  <span>Progress</span>
                  <span>{enrollment.progress}%</span>
                </div>
                <ProgressBar progress={enrollment.progress} />
              </div>

              <div className="mt-4 flex items-center justify-between text-sm text-gray-500 dark:text-gray-400">
                <span className="flex items-center gap-1">
                  <ClockIcon className="h-4 w-4" />
                  Enrolled: {new Date(enrollment.enrolledAt).toLocaleDateString()}
                </span>
                <Link
                  to={`/courses/${enrollment.courseId}`}
                  className="text-blue-600 hover:underline"
                >
                  Continue Learning →
                </Link>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default MyCourses;