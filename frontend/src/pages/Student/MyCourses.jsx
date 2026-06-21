import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowRightIcon,
  UserGroupIcon,
  DocumentTextIcon,
  MagnifyingGlassIcon,
  Squares2X2Icon,
  ListBulletIcon,
} from '@heroicons/react/24/outline';

const MyCourses = () => {
  const [filter, setFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');
  const [search, setSearch] = useState('');

  const { data: courses, isLoading } = useQuery({
    queryKey: ['student-courses'],
    queryFn: async () => {
      const response = await api.get('/student/my-courses');
      return response.data;
    },
    retry: 1
  });

  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'completed') return matchesSearch && course.completed;
    if (filter === 'in-progress') return matchesSearch && !course.completed && course.progress > 0;
    if (filter === 'not-started') return matchesSearch && course.progress === 0;
    return true;
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">My Courses</h1>
          <p className="text-slate-500 dark:text-slate-400">Continue your learning journey</p>
        </div>
        <Link
          to="/courses"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center gap-2"
        >
          <BookOpenIcon className="h-5 w-5" />
          Explore Courses
        </Link>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search your courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
        </div>
        
        <div className="flex flex-wrap gap-2">
          {['all', 'in-progress', 'not-started', 'completed'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : f === 'in-progress' ? 'In Progress' : f === 'not-started' ? 'Not Started' : 'Completed'}
              <span className={`ml-1.5 px-1.5 py-0.5 rounded-lg text-xs ${
                filter === f ? 'bg-white/20' : 'bg-slate-200 dark:bg-slate-700'
              }`}>
                {courses?.filter(c => {
                  if (f === 'all') return true;
                  if (f === 'completed') return c.completed;
                  if (f === 'in-progress') return !c.completed && c.progress > 0;
                  if (f === 'not-started') return c.progress === 0;
                  return true;
                }).length || 0}
              </span>
            </button>
          ))}
        </div>

        <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-lg p-1 border border-slate-200 dark:border-slate-700">
          <button
            onClick={() => setViewMode('grid')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'grid' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <Squares2X2Icon className="h-5 w-5" />
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`p-2 rounded-lg transition-all ${
              viewMode === 'list' ? 'bg-blue-600 text-white' : 'text-slate-400 hover:text-slate-600'
            }`}
          >
            <ListBulletIcon className="h-5 w-5" />
          </button>
        </div>
      </div>

      {filteredCourses?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <div className="flex justify-center text-6xl mb-4"><BookOpenIcon className="h-10 w-10" /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {search ? 'No matching courses found' : 'No courses yet'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {search ? 'Try adjusting your search terms' : 'Start learning by enrolling in a course'}
          </p>
          {!search && (
            <Link
              to="/courses"
              className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all inline-block"
            >
              Explore Courses
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCourses?.map((course) => (
            <div key={course.id} className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200">
              <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-6xl font-bold text-white/20">
                    {course.title?.[0]?.toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4 flex justify-between items-end">
                  <span className="text-white font-bold text-lg line-clamp-1">{course.title}</span>
                  <span className="px-3 py-1 bg-white/20 backdrop-blur-sm rounded-lg text-white text-sm font-medium">
                    {course.progress}%
                  </span>
                </div>
                {course.completed && (
                  <div className="absolute top-4 right-4 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-sm">
                    <CheckCircleIcon className="h-4 w-4" />
                    Completed
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                  {course.instructor}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-4">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    {course._count?.enrolled || 0}
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {course._count?.modules || 0} modules
                  </span>
                </div>
                <div className="mb-4">
                  <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                    <span>Progress</span>
                    <span>{course.progress}%</span>
                  </div>
                  <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden">
                    <div
                      className={`h-2 rounded-full transition-all duration-500 ${
                        course.completed ? 'bg-emerald-500' : 'bg-blue-600'
                      }`}
                      style={{ width: `${course.progress}%` }}
                    />
                  </div>
                </div>
                <Link
                  to={`/student/courses/${course.id}`}
                  className="w-full px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                >
                  {course.completed ? 'View Certificate' : course.progress > 0 ? 'Continue' : 'Start Learning'}
                  <ArrowRightIcon className="h-4 w-4" />
                </Link>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-4">
          {filteredCourses?.map((course) => (
            <div key={course.id} className="group bg-white dark:bg-slate-800 rounded-xl shadow-sm p-5 hover:shadow-md transition-all">
              <div className="flex flex-wrap items-center gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-lg bg-blue-600 flex items-center justify-center flex-shrink-0">
                      <span className="text-white font-bold text-lg">
                        {course.title?.[0]?.toUpperCase()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-slate-900 dark:text-white">{course.title}</h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400">{course.instructor}</p>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                  <div className="w-32">
                    <div className="flex justify-between text-xs text-slate-500 dark:text-slate-400 mb-1">
                      <span>Progress</span>
                      <span>{course.progress}%</span>
                    </div>
                    <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                      <div
                        className={`h-2 rounded-full transition-all duration-500 ${
                          course.completed ? 'bg-emerald-500' : 'bg-blue-600'
                        }`}
                        style={{ width: `${course.progress}%` }}
                      />
                    </div>
                  </div>
                  {course.completed && (
                    <span className="px-2 py-1 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-lg text-xs font-medium">
                      Completed
                    </span>
                  )}
                  <Link
                    to={`/student/courses/${course.id}`}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium"
                  >
                    {course.completed ? 'Certificate' : 'Continue'}
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyCourses;