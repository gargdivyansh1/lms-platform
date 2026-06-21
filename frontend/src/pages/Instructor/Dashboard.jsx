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
  PlusIcon,
  AcademicCapIcon,
  ChartBarIcon,
  TrophyIcon,
  ArrowPathIcon,
  ChevronRightIcon,
  UserGroupIcon,
  SparklesIcon,
  LightBulbIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const StatCard = ({ title, value, icon: Icon, color, gradient, subtitle, loading }) => {
  if (loading) {
    return (
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 animate-pulse border border-slate-200 dark:border-slate-700">
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-xl"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 hover:shadow-md transition-shadow border border-slate-200 dark:border-slate-700">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-xl bg-gradient-to-br ${gradient || color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const CourseCard = ({ course }) => (
  <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-all hover:border-blue-200 dark:hover:border-blue-800">
    <div className="flex items-start justify-between">
      <div className="flex-1 min-w-0">
        <h4 className="font-semibold text-slate-900 dark:text-white truncate">
          {course.title}
        </h4>
        <div className="flex flex-wrap items-center gap-3 mt-2 text-sm text-slate-500 dark:text-slate-400">
          <span className="flex items-center gap-1">
            <UserGroupIcon className="h-4 w-4" />
            {course.students || 0} students
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-1">
            <BookOpenIcon className="h-4 w-4" />
            {course.modules || 0} modules
          </span>
          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
          <span className="flex items-center gap-1">
            <DocumentTextIcon className="h-4 w-4" />
            {course.assignments || 0} assignments
          </span>
        </div>
      </div>
      <Link
        to={`/instructor/courses/${course.id}`}
        className="flex-shrink-0 ml-4 p-2 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all"
      >
        <ChevronRightIcon className="h-5 w-5" />
      </Link>
    </div>
    {course.progress !== undefined && (
      <div className="mt-3">
        <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
          <span>Course Progress</span>
          <span>{course.progress || 0}%</span>
        </div>
        <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
          <div
            className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
            style={{ width: `${course.progress || 0}%` }}
          />
        </div>
      </div>
    )}
  </div>
);

const InstructorDashboard = () => {
  const { data: stats, isLoading, refetch } = useQuery({
    queryKey: ['instructor-dashboard'],
    queryFn: async () => {
      const response = await api.get('/instructor/dashboard/stats');
      return response.data;
    },
    retry: 1
  });

  const { data: recentActivity } = useQuery({
    queryKey: ['instructor-recent'],
    queryFn: async () => {
      const response = await api.get('/instructor/dashboard/recent-activity');
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
      title: 'Total Courses',
      value: data.stats.totalCourses || 0,
      icon: BookOpenIcon,
      gradient: 'from-blue-500 to-blue-600',
      subtitle: 'Active courses'
    },
    {
      title: 'Total Students',
      value: data.stats.totalStudents || 0,
      icon: UsersIcon,
      gradient: 'from-emerald-500 to-emerald-600',
      subtitle: 'Across all courses'
    },
    {
      title: 'Assignments',
      value: data.stats.totalAssignments || 0,
      icon: DocumentTextIcon,
      gradient: 'from-purple-500 to-purple-600',
      subtitle: 'Created'
    },
    {
      title: 'Pending Grading',
      value: data.stats.pendingAssignments || 0,
      icon: ClockIcon,
      gradient: 'from-amber-500 to-amber-600',
      subtitle: data.stats.pendingAssignments > 0 ? 'Needs attention' : 'All graded'
    }
  ];

  const hasCourses = data.courses?.length > 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <AcademicCapIcon className="h-7 w-7 text-blue-600" />
            Instructor Dashboard
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Welcome back! Here's an overview of your teaching activity.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            title="Refresh data"
          >
            <ArrowPathIcon className="h-5 w-5" />
          </button>
          <Link
            to="/instructor/courses/create"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <PlusIcon className="h-5 w-5" />
            Create Course
          </Link>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Quick Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
            <TrophyIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Average Rating</p>
            <div className="flex items-center gap-2">
              <span className="text-2xl font-bold text-slate-900 dark:text-white">
                {data.stats.averageRating || 0}
              </span>
              <span className="text-sm text-slate-500 dark:text-slate-400">/ 5.0</span>
              <div className="flex text-amber-400">
                {[...Array(5)].map((_, i) => (
                  <StarIcon key={i} className={`h-4 w-4 ${i < Math.round(data.stats.averageRating || 0) ? 'fill-current' : ''}`} />
                ))}
              </div>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
            <ChartBarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Completion Rate</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.stats.totalStudents > 0 
                ? Math.round((data.stats.completedCourses || 0) / data.stats.totalStudents * 100) 
                : 0}%
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
            <LightBulbIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Courses</p>
            <p className="text-2xl font-bold text-slate-900 dark:text-white">
              {data.courses?.filter(c => c.students > 0).length || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Recent Activity & Courses */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Activity */}
        <div className="lg:col-span-1 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <ClockIcon className="h-5 w-5 text-blue-600" />
            Recent Activity
          </h3>
          {recentActivity?.recentEnrollments?.length > 0 || recentActivity?.recentSubmissions?.length > 0 ? (
            <div className="space-y-4">
              {recentActivity?.recentEnrollments?.slice(0, 3).map((activity) => (
                <div key={activity.id} className="flex items-start gap-3">
                  <div className="p-2 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg flex-shrink-0">
                    <UserGroupIcon className="h-4 w-4 text-emerald-600 dark:text-emerald-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {activity.user?.name} enrolled
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      in {activity.course?.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(activity.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
              {recentActivity?.recentSubmissions?.slice(0, 2).map((submission) => (
                <div key={submission.id} className="flex items-start gap-3">
                  <div className="p-2 bg-amber-100 dark:bg-amber-900/20 rounded-lg flex-shrink-0">
                    <DocumentTextIcon className="h-4 w-4 text-amber-600 dark:text-amber-400" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-slate-900 dark:text-white truncate">
                      {submission.user?.name} submitted
                    </p>
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                      {submission.title}
                    </p>
                    <p className="text-xs text-slate-400 dark:text-slate-500">
                      {new Date(submission.submittedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-center text-slate-500 dark:text-slate-400 py-8">
              No recent activity
            </p>
          )}
        </div>

        {/* My Courses */}
        <div className="lg:col-span-2 bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <BookOpenIcon className="h-5 w-5 text-blue-600" />
              My Courses
            </h3>
            <Link
              to="/instructor/courses"
              className="text-sm text-blue-600 hover:underline flex items-center gap-1"
            >
              View All
              <ChevronRightIcon className="h-4 w-4" />
            </Link>
          </div>
          {hasCourses ? (
            <div className="space-y-3">
              {data.courses.slice(0, 4).map((course) => (
                <CourseCard key={course.id} course={course} />
              ))}
              {data.courses.length > 4 && (
                <Link
                  to="/instructor/courses"
                  className="block text-center text-sm text-blue-600 hover:underline py-2"
                >
                  View all {data.courses.length} courses →
                </Link>
              )}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="text-6xl mb-4">📚</div>
              <h4 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
                No Courses Yet
              </h4>
              <p className="text-slate-500 dark:text-slate-400 mb-4">
                Start creating your first course and share your knowledge.
              </p>
              <Link
                to="/instructor/courses/create"
                className="inline-flex items-center px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
              >
                <PlusIcon className="h-5 w-5 mr-2" />
                Create Course
              </Link>
            </div>
          )}
        </div>
      </div>

      {/* Quick Actions */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Link
          to="/instructor/students"
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-700 group"
        >
          <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-xl group-hover:bg-blue-200 dark:group-hover:bg-blue-900/30 transition-colors">
            <UsersIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">View Students</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.stats.totalStudents || 0} students enrolled
            </p>
          </div>
          <ChevronRightIcon className="ml-auto h-5 w-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
        </Link>
        <Link
          to="/instructor/assignments"
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-700 group"
        >
          <div className="p-2.5 bg-amber-100 dark:bg-amber-900/20 rounded-xl group-hover:bg-amber-200 dark:group-hover:bg-amber-900/30 transition-colors">
            <DocumentTextIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">Grade Assignments</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {data.stats.pendingAssignments || 0} pending to grade
            </p>
          </div>
          <ChevronRightIcon className="ml-auto h-5 w-5 text-slate-400 group-hover:text-amber-600 transition-colors" />
        </Link>
        <Link
          to="/instructor/analytics"
          className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-4 hover:shadow-md transition-all flex items-center gap-3 border border-slate-200 dark:border-slate-700 group"
        >
          <div className="p-2.5 bg-purple-100 dark:bg-purple-900/20 rounded-xl group-hover:bg-purple-200 dark:group-hover:bg-purple-900/30 transition-colors">
            <ChartBarIcon className="h-5 w-5 text-purple-600 dark:text-purple-400" />
          </div>
          <div>
            <p className="text-sm font-medium text-slate-900 dark:text-white">View Analytics</p>
            <p className="text-xs text-slate-500 dark:text-slate-400">Track course performance</p>
          </div>
          <ChevronRightIcon className="ml-auto h-5 w-5 text-slate-400 group-hover:text-purple-600 transition-colors" />
        </Link>
      </div>
    </div>
  );
};

export default InstructorDashboard;