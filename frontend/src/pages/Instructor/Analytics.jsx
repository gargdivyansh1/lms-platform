import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  ChartBarIcon,
  UserGroupIcon,
  AcademicCapIcon,
  DocumentTextIcon,
  ArrowUpIcon,
  ArrowDownIcon,
  StarIcon
} from '@heroicons/react/24/outline';

const InstructorAnalytics = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');

  const { data: courses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses');
      return response.data;
    }
  });

  const { data: analytics, isLoading } = useQuery({
    queryKey: ['instructor-analytics', selectedCourse],
    queryFn: async () => {
      if (selectedCourse === 'all') {
        const response = await api.get('/instructor/analytics/overview');
        return response.data;
      } else {
        const response = await api.get(`/instructor/analytics/course/${selectedCourse}`);
        return response.data;
      }
    },
    enabled: !!courses
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  const stats = analytics?.overview || analytics?.analytics || {};

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between flex-wrap gap-4">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Analytics</h1>
        <select
          value={selectedCourse}
          onChange={(e) => setSelectedCourse(e.target.value)}
          className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg dark:bg-gray-700 dark:text-white"
        >
          <option value="all">All Courses</option>
          {courses?.map(course => (
            <option key={course.id} value={course.id}>{course.title}</option>
          ))}
        </select>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Total Students</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.totalStudents || 0}
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Progress</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageProgress?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-green-500 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-green-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.averageProgress || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-500 dark:text-gray-400">Average Grade</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.averageGrade?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-500 rounded-lg">
              <AcademicCapIcon className="h-6 w-6 text-white" />
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
              <p className="text-sm text-gray-500 dark:text-gray-400">Completion Rate</p>
              <p className="text-2xl font-bold text-gray-900 dark:text-white">
                {stats.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-orange-500 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
            <div
              className="bg-orange-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.completionRate || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Course Performance */}
      {selectedCourse === 'all' && analytics?.courseCompletion && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Course Performance
          </h3>
          <div className="space-y-4">
            {analytics.courseCompletion.map((course) => (
              <div key={course.courseId} className="border-b border-gray-200 dark:border-gray-700 pb-4 last:border-0">
                <div className="flex items-center justify-between mb-2">
                  <div>
                    <p className="font-medium text-gray-900 dark:text-white">{course.title}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400">
                      {course.totalStudents || 0} students • {course.completed || 0} completed
                    </p>
                  </div>
                  <span className="text-sm font-semibold text-blue-600 dark:text-blue-400">
                    {course.completionRate?.toFixed(1) || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.min(course.completionRate || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students List for specific course */}
      {selectedCourse !== 'all' && analytics?.students && (
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white mb-4">
            Student Progress
          </h3>
          <div className="space-y-3">
            {analytics.students.map((student) => (
              <div key={student.name} className="flex items-center justify-between border-b border-gray-200 dark:border-gray-700 pb-3 last:border-0">
                <div>
                  <p className="font-medium text-gray-900 dark:text-white">{student.name}</p>
                  <p className="text-sm text-gray-500 dark:text-gray-400">{student.email}</p>
                </div>
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                        style={{ width: `${student.progress || 0}%` }}
                      />
                    </div>
                    <span className="text-sm text-gray-500 dark:text-gray-400">
                      {student.progress || 0}%
                    </span>
                  </div>
                  <span className={`text-sm font-medium ${student.completed ? 'text-green-500' : 'text-yellow-500'}`}>
                    {student.completed ? 'Completed' : 'In Progress'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default InstructorAnalytics;