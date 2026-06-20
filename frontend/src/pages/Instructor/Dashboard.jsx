import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  UsersIcon,
  BookOpenIcon,
  DocumentTextIcon,
  ClockIcon,
  StarIcon,
  PlusIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 animate-pulse">
        <div className="h-20 bg-gray-200 dark:bg-gray-700 rounded"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500 dark:text-gray-400">{title}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white mt-1">{value}</p>
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const InstructorDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: async () => {
      const response = await api.get('/instructor/dashboard/stats');
      return response.data;
    },
    retry: 1
  });

  const fallbackStats = {
    stats: {
      totalCourses: 0,
      totalStudents: 0,
      totalAssignments: 0,
      pendingAssignments: 0,
      averageRating: 0
    },
    courses: []
  };

  const data = stats || fallbackStats;

  const statCards = [
    {
      title: 'My Courses',
      value: data.stats.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-500'
    },
    {
      title: 'My Students',
      value: data.stats.totalStudents || 0,
      icon: UsersIcon,
      color: 'bg-green-500'
    },
    {
      title: 'Assignments Created',
      value: data.stats.totalAssignments || 0,
      icon: DocumentTextIcon,
      color: 'bg-purple-500'
    },
    {
      title: 'Pending Grading',
      value: data.stats.pendingAssignments || 0,
      icon: ClockIcon,
      color: 'bg-orange-500'
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
          <p className="text-gray-500 dark:text-gray-400">Welcome back! Here's what's happening with your courses.</p>
        </div>
        <Link
          to="/instructor/courses/create"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
        >
          <PlusIcon className="h-5 w-5" />
          Create Course
        </Link>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Rating */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm text-gray-500 dark:text-gray-400">Average Rating</p>
            <div className="flex items-center mt-1">
              <span className="text-3xl font-bold text-gray-900 dark:text-white">
                {data.stats.averageRating || 0}
              </span>
              <span className="text-gray-500 dark:text-gray-400 ml-2">/ 5.0</span>
              <div className="ml-4 flex text-yellow-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-5 w-5 ${i < Math.round(data.stats.averageRating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
            </div>
          </div>
          <div className="text-sm text-gray-500 dark:text-gray-400">
            Based on student reviews
          </div>
        </div>
      </div>

      {/* My Courses */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
            My Courses
          </h3>
          <Link
            to="/instructor/courses"
            className="text-sm text-blue-600 hover:underline"
          >
            View All →
          </Link>
        </div>
        {data.courses?.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {data.courses.slice(0, 3).map((course) => (
              <div key={course.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <h4 className="font-semibold text-gray-900 dark:text-white">{course.title}</h4>
                <div className="mt-2 grid grid-cols-3 gap-2 text-sm text-gray-500 dark:text-gray-400">
                  <span>{course.students} students</span>
                  <span>{course.modules} modules</span>
                  <span>{course.assignments} assignments</span>
                </div>
                <Link
                  to={`/instructor/courses/${course.id}`}
                  className="mt-3 inline-block text-sm text-blue-600 hover:underline"
                >
                  Manage Course →
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 text-gray-500 dark:text-gray-400">
            <p>You haven't created any courses yet.</p>
            <Link
              to="/instructor/courses/create"
              className="mt-2 inline-block text-blue-600 hover:underline"
            >
              Create your first course →
            </Link>
          </div>
        )}
      </div>
    </div>
  );
};

export default InstructorDashboard;