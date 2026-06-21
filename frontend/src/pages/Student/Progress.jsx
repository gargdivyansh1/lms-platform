import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  ChartBarIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  TrophyIcon,
  ArrowRightIcon,
  BookOpenIcon,
  UserGroupIcon
} from '@heroicons/react/24/outline';

const Progress = () => {
  const { data: progress, isLoading } = useQuery({
    queryKey: ['student-overall-progress'],
    queryFn: async () => {
      const response = await api.get('/student/progress/overall');
      return response.data;
    },
    retry: 1
  });

  const { data: certificates } = useQuery({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const response = await api.get('/student/certificates');
      return response.data;
    },
    retry: 1
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const stats = progress || {
    totalCourses: 0,
    completedCourses: 0,
    completionRate: 0,
    averageProgress: 0,
    timeSpent: { total: 0, weekly: 0 },
    courses: []
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Learning Progress</h1>
        <p className="text-slate-500 dark:text-slate-400">Track your learning journey and achievements</p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Courses</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.totalCourses}</p>
            </div>
            <div className="p-3 bg-blue-600 rounded-lg">
              <BookOpenIcon className="h-6 w-6 text-white" />
            </div>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.completedCourses}</p>
            </div>
            <div className="p-3 bg-emerald-600 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {stats.completionRate}% completion rate
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Progress</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.averageProgress}%</p>
            </div>
            <div className="p-3 bg-indigo-600 rounded-lg">
              <ChartBarIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-indigo-600 h-2 rounded-full transition-all duration-500"
              style={{ width: `${stats.averageProgress}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Time Spent</p>
              <p className="text-2xl font-bold text-slate-900 dark:text-white">{stats.timeSpent?.total || 0}h</p>
            </div>
            <div className="p-3 bg-amber-600 rounded-lg">
              <ClockIcon className="h-6 w-6 text-white" />
            </div>
          </div>
          <div className="mt-2 text-sm text-slate-500 dark:text-slate-400">
            {stats.timeSpent?.weekly || 0}h this week
          </div>
        </div>
      </div>

      {/* Certificates Section */}
      {certificates && certificates.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <TrophyIcon className="h-5 w-5 text-amber-500" />
              Your Certificates
            </h2>
            <Link to="/student/certificates" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {certificates.slice(0, 3).map((cert) => (
              <div key={cert.id} className="flex flex-col border border-slate-200 dark:border-slate-700 rounded-lg p-4 hover:shadow-md transition-shadow">
                <div className="flex items-center gap-3">
                  <TrophyIcon className="h-8 w-8 text-amber-500" />
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{cert.course?.title}</p>
                    <p className="text-xs text-slate-500 dark:text-slate-400">
                      Issued: {new Date(cert.issuedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => {
                    window.open(`${import.meta.env.VITE_API_URL}${cert.fileUrl}`, '_blank');
                  }}
                  className="mt-auto w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                >
                  Download PDF
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Course Progress List */}
      <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Course Progress
        </h2>
        {stats.courses?.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No courses enrolled yet. Start learning today!
          </p>
        ) : (
          <div className="space-y-4">
            {stats.courses.map((course) => (
              <div key={course.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0 last:pb-0">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {course.title}
                    </p>
                    <div className="flex items-center gap-2 mt-1">
                      <div className="flex-1 max-w-xs">
                        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className={`h-2 rounded-full transition-all duration-500 ${
                              course.completed ? 'bg-emerald-500' : 'bg-blue-600'
                            }`}
                            style={{ width: `${course.progress}%` }}
                          />
                        </div>
                      </div>
                      <span className="text-sm text-slate-500 dark:text-slate-400 whitespace-nowrap">
                        {course.progress}%
                      </span>
                    </div>
                  </div>
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="inline-flex items-center text-sm text-blue-600 hover:underline whitespace-nowrap"
                  >
                    {course.completed ? 'View Certificate' : 'Continue'}
                    <ArrowRightIcon className="h-3 w-3 ml-1" />
                  </Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Progress;