import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  PencilIcon,
  TrashIcon,
  EyeIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentTextIcon,
  Squares2X2Icon,
  ListBulletIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  StarIcon,
  ClockIcon,
  ArrowPathIcon,
  MagnifyingGlassCircleIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const InstructorCourses = () => {
  const queryClient = useQueryClient();
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid');
  const [sortBy, setSortBy] = useState('newest');
  const [expandedCourse, setExpandedCourse] = useState(null);

  const { data: courses, isLoading, refetch } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses');
      return response.data;
    },
    retry: 1
  });

  const deleteCourseMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.delete(`/instructor/courses/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-courses']);
      queryClient.invalidateQueries(['instructor-dashboard']);
      toast.success('Course deleted successfully');
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to delete course');
    }
  });

  const handleDelete = (courseId, courseTitle) => {
    if (window.confirm(`Are you sure you want to delete "${courseTitle}"?`)) {
      deleteCourseMutation.mutate(courseId);
    }
  };

  const toggleExpand = (courseId) => {
    setExpandedCourse(expandedCourse === courseId ? null : courseId);
  };

  // Filter and sort courses
  const filteredCourses = courses?.filter(course => {
    const matchesSearch = course.title.toLowerCase().includes(search.toLowerCase()) ||
                          course.description.toLowerCase().includes(search.toLowerCase()) ||
                          course.instructor.toLowerCase().includes(search.toLowerCase());
    return matchesSearch;
  });

  const sortedCourses = filteredCourses?.sort((a, b) => {
    switch (sortBy) {
      case 'newest':
        return new Date(b.createdAt) - new Date(a.createdAt);
      case 'oldest':
        return new Date(a.createdAt) - new Date(b.createdAt);
      case 'students':
        return (b._count?.enrolled || 0) - (a._count?.enrolled || 0);
      case 'modules':
        return (b._count?.modules || 0) - (a._count?.modules || 0);
      default:
        return 0;
    }
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  const totalCourses = courses?.length || 0;
  const totalStudents = courses?.reduce((acc, c) => acc + (c._count?.enrolled || 0), 0) || 0;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenIcon className="h-7 w-7 text-blue-600" />
            My Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage and organize all your courses
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => refetch()}
            className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
            title="Refresh"
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

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search courses..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-colors"
          />
          <MagnifyingGlassCircleIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
        </div>

        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="oldest">Oldest First</option>
          <option value="students">Most Students</option>
          <option value="modules">Most Modules</option>
        </select>

        <div className="flex gap-1 bg-white dark:bg-slate-800 rounded-xl p-1 border border-slate-300 dark:border-slate-600">
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

      {sortedCourses?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-7xl mb-4">📚</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {search ? 'No matching courses found' : 'No Courses Yet'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6">
            {search ? 'Try adjusting your search terms' : 'Start creating your first course and share your knowledge.'}
          </p>
          {!search && (
            <Link
              to="/instructor/courses/create"
              className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
            >
              <PlusIcon className="h-5 w-5 mr-2" />
              Create Course
            </Link>
          )}
        </div>
      ) : viewMode === 'grid' ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {sortedCourses?.map((course) => (
            <div key={course.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-slate-200 dark:border-slate-700">
              <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                {course.thumbnail ? (
                  <img src={course.thumbnail} alt={course.title} className="w-full h-full object-cover" />
                ) : (
                  <span className="text-7xl font-bold text-white/20">
                    {course.title?.[0]?.toUpperCase()}
                  </span>
                )}
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                <div className="absolute bottom-4 left-4 right-4">
                  <span className="text-white font-bold text-lg line-clamp-1">{course.title}</span>
                </div>
                {course.featured && (
                  <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg">
                    <StarSolidIcon className="h-3 w-3" />
                    Featured
                  </div>
                )}
              </div>
              <div className="p-5">
                <p className="text-sm text-slate-500 dark:text-slate-400 mb-2 line-clamp-1">
                  {course.instructor}
                </p>
                <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                  {course.description}
                </p>
                <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                  <span className="flex items-center gap-1">
                    <UserGroupIcon className="h-4 w-4" />
                    {course._count?.enrolled || 0} students
                  </span>
                  <span className="flex items-center gap-1">
                    <BookOpenIcon className="h-4 w-4" />
                    {course._count?.modules || 0} modules
                  </span>
                  <span className="flex items-center gap-1">
                    <DocumentTextIcon className="h-4 w-4" />
                    {course._count?.assignments || 0} assignments
                  </span>
                </div>
                <div className="flex gap-2">
                  <Link
                    to={`/instructor/courses/${course.id}`}
                    className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <PencilIcon className="h-4 w-4" />
                    Manage
                  </Link>
                  <Link
                    to={`/courses/${course.id}`}
                    className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-1 text-sm"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </Link>
                  <button
                    onClick={() => handleDelete(course.id, course.title)}
                    className="px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all"
                  >
                    <TrashIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-3">
          {sortedCourses?.map((course) => (
            <div key={course.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden hover:shadow-md transition-all">
              <div 
                className="p-4 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => toggleExpand(course.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center flex-shrink-0">
                        <span className="text-white font-bold text-lg">
                          {course.title?.[0]?.toUpperCase()}
                        </span>
                      </div>
                      <div className="min-w-0">
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {course.title}
                        </h3>
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          {course.instructor}
                        </p>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 flex-shrink-0">
                    <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <UserGroupIcon className="h-4 w-4" />
                      {course._count?.enrolled || 0}
                    </span>
                    <span className="flex items-center gap-1 text-sm text-slate-500 dark:text-slate-400">
                      <BookOpenIcon className="h-4 w-4" />
                      {course._count?.modules || 0}
                    </span>
                    {expandedCourse === course.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </div>
              </div>
              {expandedCourse === course.id && (
                <div className="p-4 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                  <div className="space-y-3">
                    <p className="text-sm text-slate-600 dark:text-slate-300">
                      {course.description}
                    </p>
                    <div className="flex flex-wrap gap-3">
                      <Link
                        to={`/instructor/courses/${course.id}`}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm"
                      >
                        <PencilIcon className="h-4 w-4 mr-2" />
                        Edit Course
                      </Link>
                      <Link
                        to={`/instructor/students?course=${course.id}`}
                        className="inline-flex items-center px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all text-sm"
                      >
                        <UserGroupIcon className="h-4 w-4 mr-2" />
                        View Students
                      </Link>
                      <Link
                        to={`/instructor/assignments?course=${course.id}`}
                        className="inline-flex items-center px-4 py-2 bg-purple-600 text-white rounded-xl hover:bg-purple-700 transition-all text-sm"
                      >
                        <DocumentTextIcon className="h-4 w-4 mr-2" />
                        Assignments
                      </Link>
                      <button
                        onClick={() => handleDelete(course.id, course.title)}
                        className="inline-flex items-center px-4 py-2 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400 rounded-xl hover:bg-red-100 dark:hover:bg-red-900/30 transition-all text-sm"
                      >
                        <TrashIcon className="h-4 w-4 mr-2" />
                        Delete
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default InstructorCourses;