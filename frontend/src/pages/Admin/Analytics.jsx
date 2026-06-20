import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  ChartBarIcon,
  UserGroupIcon,
  BookOpenIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon
} from '@heroicons/react/24/outline';

const Analytics = () => {
  const { data: analytics, isLoading } = useQuery({
    queryKey: ['admin-analytics'],
    queryFn: async () => {
      const [userData, courseData, engagementData] = await Promise.all([
        api.get('/admin/analytics/users'),
        api.get('/admin/analytics/courses'),
        api.get('/admin/analytics/engagement')
      ]);
      return {
        users: userData.data,
        courses: courseData.data,
        engagement: engagementData.data
      };
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <div className="flex gap-2">
          <select className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white">
            <option value="7d">Last 7 days</option>
            <option value="30d">Last 30 days</option>
            <option value="90d">Last 90 days</option>
            <option value="1y">Last year</option>
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Users</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.users?.roleDistribution?.reduce((acc, curr) => acc + curr._count, 0) || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-500 rounded-lg">
              <UserGroupIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              12%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Courses</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.courses?.totalCourses || 0}
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              8%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Enrollments</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.engagement?.dailyActiveUsers || 0}
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-red-500 flex items-center">
              <ArrowDownIcon className="h-4 w-4 mr-1" />
              3%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {analytics?.engagement?.userRetention || 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 flex items-center text-sm">
            <span className="text-green-500 flex items-center">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              5%
            </span>
            <span className="text-gray-500 dark:text-gray-400 ml-2">from last month</span>
          </div>
        </div>
      </div>

      {/* Charts Section */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* User Growth Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            User Growth
          </h3>
          <div className="h-64 flex items-center justify-center text-gray-500 dark:text-gray-400">
            <ChartBarIcon className="h-16 w-16" />
            <p className="ml-4">Chart component would go here</p>
          </div>
        </div>

        {/* Course Popularity Chart */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Popular Courses
          </h3>
          <div className="space-y-4">
            {analytics?.courses?.popularCourses?.slice(0, 5).map((course, index) => (
              <div key={index} className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <span className="text-sm font-medium text-gray-500 dark:text-gray-400">
                    #{index + 1}
                  </span>
                  <span className="text-sm text-gray-900 dark:text-white">
                    {course.title}
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <div className="w-32 h-2 bg-gray-200 dark:bg-gray-700 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-blue-500 rounded-full"
                      style={{ width: `${(course.students / (analytics?.courses?.popularCourses?.[0]?.students || 1)) * 100}%` }}
                    />
                  </div>
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {course.students}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Role Distribution */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
          User Role Distribution
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {analytics?.users?.roleDistribution?.map((role) => (
            <div key={role.role} className="p-4 bg-gray-50 dark:bg-gray-700 rounded-lg">
              <p className="text-sm text-gray-500 dark:text-gray-400 capitalize">
                {role.role.toLowerCase()}s
              </p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {role._count}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Analytics;