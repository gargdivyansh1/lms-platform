import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  UsersIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  UserGroupIcon,
  ClockIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, change, loading }) => {
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
      {change !== undefined && (
        <div className="mt-4 flex items-center">
          {change > 0 ? (
            <ArrowUpIcon className="h-4 w-4 text-green-500" />
          ) : change < 0 ? (
            <ArrowDownIcon className="h-4 w-4 text-red-500" />
          ) : null}
          {change !== 0 && (
            <span className={`text-sm ${change > 0 ? 'text-green-500' : 'text-red-500'} ml-1`}>
              {Math.abs(change)}%
            </span>
          )}
          <span className="text-sm text-gray-500 dark:text-gray-400 ml-2">from last month</span>
        </div>
      )}
    </div>
  );
};

const AdminDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['admin-dashboard'],
    queryFn: async () => {
      const response = await api.get('/admin/dashboard/stats');
      return response.data;
    },
    retry: 1
  });

  // Fallback data if API fails
  const fallbackStats = {
    stats: {
      totalUsers: 0,
      totalCourses: 0,
      totalEnrollments: 0,
      totalAssignments: 0,
      completedCourses: 0,
      averageGrade: 0,
      completionRate: 0
    },
    recentActivity: {
      recentUsers: [],
      recentEnrollments: []
    }
  };

  const data = stats || fallbackStats;

  const statCards = [
    {
      title: 'Total Users',
      value: data.stats.totalUsers || 0,
      icon: UsersIcon,
      color: 'bg-blue-500',
      change: 12
    },
    {
      title: 'Total Courses',
      value: data.stats.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-green-500',
      change: 8
    },
    {
      title: 'Total Enrollments',
      value: data.stats.totalEnrollments || 0,
      icon: AcademicCapIcon,
      color: 'bg-purple-500',
      change: -3
    },
    {
      title: 'Assignments',
      value: data.stats.totalAssignments || 0,
      icon: DocumentTextIcon,
      color: 'bg-orange-500',
      change: 5
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Dashboard</h1>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm">
            Export Report
          </button>
          <button className="px-4 py-2 border border-gray-300 dark:border-gray-600 text-gray-700 dark:text-gray-300 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors text-sm">
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Additional Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <CheckCircleIcon className="h-8 w-8 text-green-500" />
          </div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(data.stats.completionRate || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.averageGrade?.toFixed(1) || 0}%
              </p>
            </div>
            <AcademicCapIcon className="h-8 w-8 text-blue-500" />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completed Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {data.stats.completedCourses || 0}
              </p>
            </div>
            <UserGroupIcon className="h-8 w-8 text-purple-500" />
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Users */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Users
          </h3>
          <div className="space-y-3">
            {data.recentActivity?.recentUsers?.length > 0 ? (
              data.recentActivity.recentUsers.slice(0, 5).map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                      {user.name?.[0]?.toUpperCase() || 'U'}
                    </div>
                    <div>
                      <p className="text-sm font-medium text-gray-900 dark:text-white">
                        {user.name}
                      </p>
                      <p className="text-xs text-gray-500 dark:text-gray-400">
                        {user.email}
                      </p>
                    </div>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(user.createdAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No recent users
              </p>
            )}
          </div>
        </div>

        {/* Recent Enrollments */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Recent Enrollments
          </h3>
          <div className="space-y-3">
            {data.recentActivity?.recentEnrollments?.length > 0 ? (
              data.recentActivity.recentEnrollments.slice(0, 5).map((enrollment) => (
                <div key={enrollment.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-gray-900 dark:text-white">
                      {enrollment.user?.name || 'Unknown User'}
                    </p>
                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Enrolled in: {enrollment.course?.title || 'Unknown Course'}
                    </p>
                  </div>
                  <span className="text-xs text-gray-500 dark:text-gray-400">
                    {new Date(enrollment.enrolledAt).toLocaleDateString()}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-center text-gray-500 dark:text-gray-400 py-4">
                No recent enrollments
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;