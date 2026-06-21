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
  StarIcon,
  BookOpenIcon,
  ClockIcon,
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  SparklesIcon,
  ArrowPathIcon,
  CheckCircleIcon,
  XCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const InstructorAnalytics = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [expandedStudent, setExpandedStudent] = useState(null);

  const { data: courses } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses');
      return response.data;
    }
  });

  const { data: analytics, isLoading, refetch } = useQuery({
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
    enabled: !!courses,
    retry: 1
  });

  const toggleStudentExpand = (studentId) => {
    setExpandedStudent(expandedStudent === studentId ? null : studentId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const stats = analytics?.overview || analytics?.analytics || {};
  const courseCompletion = analytics?.courseCompletion || [];
  const students = analytics?.students || [];

  const getGradeColor = (grade) => {
    if (grade >= 80) return 'text-emerald-600 dark:text-emerald-400';
    if (grade >= 60) return 'text-amber-600 dark:text-amber-400';
    return 'text-red-600 dark:text-red-400';
  };

  const getGradeBg = (grade) => {
    if (grade >= 80) return 'bg-emerald-50 dark:bg-emerald-900/20';
    if (grade >= 60) return 'bg-amber-50 dark:bg-amber-900/20';
    return 'bg-red-50 dark:bg-red-900/20';
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <ChartBarIcon className="h-7 w-7 text-blue-600" />
            Analytics
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Track your course performance and student progress
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
          <select
            value={selectedCourse}
            onChange={(e) => setSelectedCourse(e.target.value)}
            className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
          >
            <option value="all">All Courses</option>
            {courses?.map(course => (
              <option key={course.id} value={course.id}>{course.title}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Total Students</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.totalStudents || 0}
              </p>
            </div>
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-xl">
              <UserGroupIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-emerald-500 flex items-center">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              12%
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Progress</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.averageProgress?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-xl">
              <ChartBarIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.averageProgress || 0, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Average Grade</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.averageGrade?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-purple-100 dark:bg-purple-900/20 rounded-xl">
              <AcademicCapIcon className="h-6 w-6 text-purple-600 dark:text-purple-400" />
            </div>
          </div>
          <div className="mt-3 flex items-center text-sm">
            <span className="text-emerald-500 flex items-center">
              <ArrowUpIcon className="h-4 w-4 mr-1" />
              8%
            </span>
            <span className="text-slate-500 dark:text-slate-400 ml-2">from last month</span>
          </div>
        </div>

        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700 hover:shadow-md transition-shadow">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500 dark:text-slate-400">Completion Rate</p>
              <p className="text-3xl font-bold text-slate-900 dark:text-white mt-1">
                {stats.completionRate?.toFixed(1) || 0}%
              </p>
            </div>
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-xl">
              <TrophyIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
          </div>
          <div className="mt-3 w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
            <div
              className="bg-amber-500 h-2 rounded-full transition-all duration-500"
              style={{ width: `${Math.min(stats.completionRate || 0, 100)}%` }}
            />
          </div>
        </div>
      </div>

      {/* Additional Stats Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-2.5 bg-indigo-100 dark:bg-indigo-900/20 rounded-lg">
            <BookOpenIcon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Courses</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.totalCourses || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-2.5 bg-rose-100 dark:bg-rose-900/20 rounded-lg">
            <DocumentTextIcon className="h-5 w-5 text-rose-600 dark:text-rose-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Total Assignments</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.totalAssignments || 0}
            </p>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700 flex items-center gap-4">
          <div className="p-2.5 bg-teal-100 dark:bg-teal-900/20 rounded-lg">
            <SparklesIcon className="h-5 w-5 text-teal-600 dark:text-teal-400" />
          </div>
          <div>
            <p className="text-sm text-slate-500 dark:text-slate-400">Active Students</p>
            <p className="text-xl font-bold text-slate-900 dark:text-white">
              {stats.activeStudents || stats.totalStudents || 0}
            </p>
          </div>
        </div>
      </div>

      {/* Course Performance */}
      {selectedCourse === 'all' && courseCompletion.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
            <BookOpenIcon className="h-5 w-5 text-blue-600" />
            Course Performance
          </h3>
          <div className="space-y-4">
            {courseCompletion.map((course) => (
              <div key={course.courseId} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between mb-2">
                  <div>
                    <p className="font-semibold text-slate-900 dark:text-white">{course.title}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {course.totalStudents || 0} students enrolled • {course.completed || 0} completed
                    </p>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-bold text-blue-600 dark:text-blue-400">
                      {course.completionRate?.toFixed(1) || 0}%
                    </span>
                    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                      course.completionRate >= 70 
                        ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                        : course.completionRate >= 40
                        ? 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                        : 'bg-red-100 dark:bg-red-900/20 text-red-700 dark:text-red-300'
                    }`}>
                      {course.completionRate >= 70 ? 'Excellent' : course.completionRate >= 40 ? 'Average' : 'Needs Improvement'}
                    </span>
                  </div>
                </div>
                <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2.5">
                  <div
                    className={`h-2.5 rounded-full transition-all duration-500 ${
                      course.completionRate >= 70 
                        ? 'bg-emerald-500' 
                        : course.completionRate >= 40
                        ? 'bg-amber-500'
                        : 'bg-red-500'
                    }`}
                    style={{ width: `${Math.min(course.completionRate || 0, 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Students List for specific course */}
      {selectedCourse !== 'all' && students.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
              <UserGroupIcon className="h-5 w-5 text-blue-600" />
              Student Progress
            </h3>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {students.length} students
            </span>
          </div>
          <div className="space-y-3">
            {students.map((student) => (
              <div 
                key={student.id || student.name} 
                className={`border rounded-xl transition-all ${
                  expandedStudent === student.id 
                    ? 'border-blue-200 dark:border-blue-800 bg-blue-50/30 dark:bg-blue-900/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div 
                  className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/30 rounded-xl transition-colors"
                  onClick={() => toggleStudentExpand(student.id || student.name)}
                >
                  <div className="flex flex-wrap items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm flex-shrink-0">
                        {student.name?.[0]?.toUpperCase() || 'S'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {student.name || 'Unknown Student'}
                        </p>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {student.email || 'No email'}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <div className="w-24 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                          <div
                            className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                            style={{ width: `${student.progress || 0}%` }}
                          />
                        </div>
                        <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                          {student.progress || 0}%
                        </span>
                      </div>
                      <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        student.completed 
                          ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                          : 'bg-amber-100 dark:bg-amber-900/20 text-amber-700 dark:text-amber-300'
                      }`}>
                        {student.completed ? 'Completed' : 'In Progress'}
                      </span>
                      {expandedStudent === (student.id || student.name) ? (
                        <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                      )}
                    </div>
                  </div>
                </div>
                {expandedStudent === (student.id || student.name) && (
                  <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30 rounded-b-xl">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Course Progress</p>
                        <div className="mt-1 flex items-center gap-3">
                          <div className="flex-1 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                            <div
                              className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${student.progress || 0}%` }}
                            />
                          </div>
                          <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                            {student.progress || 0}%
                          </span>
                        </div>
                        {student.grade !== undefined && (
                          <div className="mt-2">
                            <p className="text-sm text-slate-500 dark:text-slate-400">Average Grade</p>
                            <p className={`text-xl font-bold ${getGradeColor(student.grade)}`}>
                              {student.grade}%
                            </p>
                          </div>
                        )}
                      </div>
                      <div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">Status</p>
                        <div className="mt-1 flex items-center gap-3">
                          {student.completed ? (
                            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400">
                              <CheckCircleIcon className="h-5 w-5" />
                              Course Completed
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5 text-amber-600 dark:text-amber-400">
                              <ClockIcon className="h-5 w-5" />
                              In Progress
                            </span>
                          )}
                        </div>
                        {student.lastActive && (
                          <p className="mt-1 text-xs text-slate-400 dark:text-slate-500">
                            Last active: {new Date(student.lastActive).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Empty State */}
      {selectedCourse !== 'all' && students.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">📊</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Students Enrolled
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            This course doesn't have any students yet.
          </p>
        </div>
      )}

      {/* No Analytics Data */}
      {selectedCourse === 'all' && courseCompletion.length === 0 && (
        <div className="text-center py-12 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-6xl mb-4">📈</div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-2">
            No Analytics Data Yet
          </h3>
          <p className="text-slate-500 dark:text-slate-400">
            Start creating courses and enrolling students to see analytics.
          </p>
        </div>
      )}
    </div>
  );
};

export default InstructorAnalytics;