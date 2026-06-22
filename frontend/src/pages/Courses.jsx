// frontend/src/pages/Courses.jsx
import React, { useState, useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  MagnifyingGlassIcon,
  UserGroupIcon,
  BookOpenIcon,
  StarIcon,
  AcademicCapIcon,
  SparklesIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon } from '@heroicons/react/24/solid';

const Courses = () => {
  const { isAuthenticated, isInstructor, user } = useAuth();
  const navigate = useNavigate();
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [sortBy, setSortBy] = useState('newest');

  // If instructor, redirect to their courses
  useEffect(() => {
    if (isInstructor) {
      navigate('/instructor/courses', { replace: true });
    }
  }, [isInstructor, navigate]);

  // Only fetch courses if not instructor
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['courses', page, search, sortBy],
    queryFn: async () => {
      // If instructor, don't fetch
      if (isInstructor) return null;
      
      const response = await api.get('/courses', {
        params: { 
          page, 
          limit: 12, 
          search,
          sort: sortBy
        }
      });
      return response.data;
    },
    enabled: !isInstructor,
    retry: 1
  });

  const handleSearch = (e) => {
    e.preventDefault();
    setSearch(searchInput);
    setPage(1);
  };

  // If instructor, don't render the page
  if (isInstructor) {
    return null;
  }

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <BookOpenIcon className="h-7 w-7 text-blue-600" />
            All Courses
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Discover and enroll in courses from expert instructors
          </p>
        </div>
        {isAuthenticated && !isInstructor && (
          <Link
            to="/student/courses"
            className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
          >
            <UserIcon className="h-5 w-5" />
            My Learning
          </Link>
        )}
      </div>

      {/* Search and Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <form onSubmit={handleSearch} className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search courses by title or instructor..."
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white transition-colors"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
        </form>

        {/* <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl dark:bg-slate-700 dark:text-white"
        >
          <option value="newest">Newest First</option>
          <option value="popular">Most Popular</option>
          <option value="rating">Highest Rated</option>
        </select> */}
      </div>

      {data?.data?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="flex justify-center text-7xl mb-4"><MagnifyingGlassIcon className='h-10 w-10' /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            {search ? 'No matching courses found' : 'No Courses Available'}
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {search ? 'Try adjusting your search terms' : 'Check back later for new courses'}
          </p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {data?.data?.map((course) => (
              <div key={course.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-slate-200 dark:border-slate-700">
                <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                  {course.thumbnail ? (
                    <img
                      src={course.thumbnail}
                      alt={course.title}
                      className="w-full h-full object-cover"
                    />
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
                      {course.modules?.length || 0} modules
                    </span>
                    {course.rating > 0 && (
                      <span className="flex items-center gap-1">
                        <StarIcon className="h-4 w-4 text-amber-400" />
                        {course.rating.toFixed(1)}
                      </span>
                    )}
                  </div>
                  <div className="flex gap-2">
                    <Link
                      to={`/courses/${course.id}`}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <BookOpenIcon className="h-4 w-4" />
                      View Details
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Pagination */}
          {data?.pagination && data.pagination.pages > 1 && (
            <div className="flex flex-wrap items-center justify-between gap-4 pt-4">
              <p className="text-sm text-slate-500 dark:text-slate-400">
                Showing {((data.pagination.page - 1) * data.pagination.limit) + 1} to{' '}
                {Math.min(data.pagination.page * data.pagination.limit, data.pagination.total)} of{' '}
                {data.pagination.total} courses
              </p>
              <div className="flex gap-2">
                <button
                  onClick={() => setPage(p => Math.max(1, p - 1))}
                  disabled={page === 1}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <ChevronLeftIcon className="h-5 w-5" />
                </button>
                {Array.from({ length: Math.min(data.pagination.pages, 5) }, (_, i) => {
                  let pageNum;
                  if (data.pagination.pages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= data.pagination.pages - 2) {
                    pageNum = data.pagination.pages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <button
                      key={pageNum}
                      onClick={() => setPage(pageNum)}
                      className={`px-4 py-2 rounded-xl transition-all ${
                        page === pageNum
                          ? 'bg-blue-600 text-white shadow-sm'
                          : 'border border-slate-300 dark:border-slate-600 hover:bg-slate-50 dark:hover:bg-slate-700'
                      }`}
                    >
                      {pageNum}
                    </button>
                  );
                })}
                <button
                  onClick={() => setPage(p => Math.min(data.pagination.pages, p + 1))}
                  disabled={page === data.pagination.pages}
                  className="px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  <ChevronRightIcon className="h-5 w-5" />
                </button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Courses;