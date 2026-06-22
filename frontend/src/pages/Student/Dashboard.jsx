// frontend/src/pages/Student/Dashboard.jsx
import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  AcademicCapIcon,
  BookOpenIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  ArrowRightIcon,
  TrophyIcon,
  CalendarIcon,
  DocumentTextIcon,
  FaceSmileIcon
} from '@heroicons/react/24/outline';

const StatCard = ({ title, value, icon: Icon, color, subtitle, loading, delay }) => {
  if (loading) {
    return (
      <div className="animate-pulse bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
        <div className="h-20 bg-slate-200 dark:bg-slate-700 rounded-lg"></div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-shadow duration-200">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500 dark:text-slate-400">{title}</p>
          <p className="text-2xl font-bold text-slate-900 dark:text-white mt-1">{value}</p>
          {subtitle && (
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">{subtitle}</p>
          )}
        </div>
        <div className={`p-3 rounded-lg ${color}`}>
          <Icon className="h-6 w-6 text-white" />
        </div>
      </div>
    </div>
  );
};

const QuickActionCard = ({ title, icon: Icon, href, description }) => (
  <Link
    to={href}
    className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6 hover:shadow-md transition-all duration-200 border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
  >
    <div className="p-3 rounded-lg bg-blue-50 dark:bg-blue-900/20 inline-block mb-3">
      <Icon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
    </div>
    <h3 className="text-base font-semibold text-slate-900 dark:text-white mb-1">{title}</h3>
    <p className="text-sm text-slate-500 dark:text-slate-400">{description}</p>
    <div className="mt-3 flex items-center text-sm font-medium text-blue-600 dark:text-blue-400 group-hover:gap-2 transition-all">
      <span>Get started</span>
      <ArrowRightIcon className="h-4 w-4" />
    </div>
  </Link>
);

const StudentDashboard = () => {
  const { data: stats, isLoading } = useQuery({
    queryKey: ['student-dashboard'],
    queryFn: async () => {
      const response = await api.get('/student/dashboard/stats');
      return response.data;
    },
    retry: 1
  });

  const fallbackStats = {
    stats: {
      totalCourses: 0,
      completedCourses: 0,
      inProgressCourses: 0,
      notStartedCourses: 0,
      averageProgress: 0,
      certificates: 0
    },
    recentActivity: [],
    upcomingAssignments: []
  };

  const data = stats || fallbackStats;

  const statCards = [
    {
      title: 'Enrolled Courses',
      value: data.stats.totalCourses || 0,
      icon: BookOpenIcon,
      color: 'bg-blue-600',
      subtitle: `${data.stats.completedCourses || 0} completed`
    },
    {
      title: 'Average Progress',
      value: `${data.stats.averageProgress || 0}%`,
      icon: ChartBarIcon,
      color: 'bg-emerald-600',
      subtitle: 'Overall completion'
    },
    {
      title: 'Certificates Earned',
      value: data.stats.certificates || 0,
      icon: TrophyIcon,
      color: 'bg-amber-600',
      subtitle: 'Achievements'
    },
    {
      title: 'Active Courses',
      value: data.stats.inProgressCourses || 0,
      icon: ClockIcon,
      color: 'bg-indigo-600',
      subtitle: `${data.stats.notStartedCourses || 0} not started`
    }
  ];

  const quickActions = [
    {
      title: 'Continue Learning',
      description: 'Resume your latest course',
      icon: AcademicCapIcon,
      href: '/student/courses'
    },
    {
      title: 'Submit Assignments',
      description: 'Complete pending work',
      icon: DocumentTextIcon,
      href: '/student/assignments'
    },
    {
      title: 'Track Progress',
      description: 'View your learning statistics',
      icon: ChartBarIcon,
      href: '/student/progress'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-gradient-to-r from-slate-800 to-slate-700 dark:from-slate-900 dark:to-slate-800 rounded-xl p-6 text-white">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold">Welcome back</h1>
            <p className="text-slate-300 mt-1">
              Continue your learning journey and track your progress.
            </p>
            <div className="flex items-center gap-3 mt-3">
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                <CheckCircleIcon className="h-4 w-4 text-emerald-400" />
                {data.stats.completedCourses || 0} Courses Completed
              </span>
              <span className="flex items-center gap-1.5 bg-white/10 backdrop-blur-sm px-3 py-1.5 rounded-lg text-sm">
                <TrophyIcon className="h-4 w-4 text-amber-400" />
                {data.stats.certificates || 0} Certificates
              </span>
            </div>
          </div>
          <div className="hidden md:block">
            <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4 text-center">
              <div className="text-3xl font-bold">{data.stats.averageProgress || 0}%</div>
              <div className="text-sm text-slate-300">Overall Progress</div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((stat, index) => (
          <StatCard key={index} {...stat} loading={isLoading} />
        ))}
      </div>

      {/* Quick Actions */}
      <div>
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4">
          Quick Actions
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {quickActions.map((action, index) => (
            <QuickActionCard key={index} {...action} />
          ))}
        </div>
      </div>

      {/* Recent Activity & Assignments */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Activity */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <ClockIcon className="h-5 w-5 text-blue-600" />
              Recent Activity
            </h3>
            <Link to="/student/courses" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {data.recentActivity?.length > 0 ? (
            <div className="space-y-3">
              {data.recentActivity.slice(0, 4).map((activity) => (
                <div key={activity.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center flex-shrink-0">
                    <BookOpenIcon className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {activity.course?.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Enrolled {new Date(activity.enrolledAt).toLocaleDateString()}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-16 bg-slate-200 dark:bg-slate-700 rounded-full h-1.5">
                      <div
                        className="bg-blue-600 h-1.5 rounded-full transition-all duration-500"
                        style={{ width: `${activity.progress}%` }}
                      />
                    </div>
                    <span className="text-xs font-medium text-slate-500 dark:text-slate-400">
                      {activity.progress}%
                    </span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className="flex justify-center text-5xl mb-3"><BookOpenIcon  className='h-10 w-10'/></div>
              <p className="text-slate-500 dark:text-slate-400">No recent activity</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">Start learning today</p>
            </div>
          )}
        </div>

        {/* Upcoming Assignments */}
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <CalendarIcon className="h-5 w-5 text-blue-600" />
              Upcoming Assignments
            </h3>
            <Link to="/student/assignments" className="text-sm text-blue-600 hover:underline font-medium">
              View all
            </Link>
          </div>
          {data.upcomingAssignments?.length > 0 ? (
            <div className="space-y-3">
              {data.upcomingAssignments.slice(0, 4).map((assignment) => (
                <div key={assignment.id} className="flex items-center gap-3 p-3 rounded-lg hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-all">
                  <div className="w-10 h-10 rounded-lg bg-emerald-50 dark:bg-emerald-900/20 flex items-center justify-center flex-shrink-0">
                    <DocumentTextIcon className="h-5 w-5 text-emerald-600" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-slate-900 dark:text-white truncate">
                      {assignment.title}
                    </p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {assignment.course?.title}
                    </p>
                  </div>
                  <Link
                    to={`/student/assignments/${assignment.id}/submit`}
                    className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all"
                  >
                    Submit
                  </Link>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <div className='flex items-center justify-center'><DocumentTextIcon className='h-10 w-10'/></div>
              <p className="text-slate-500 dark:text-slate-400">No pending assignments</p>
              <p className="text-sm text-slate-400 dark:text-slate-500">You are up to date</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StudentDashboard;