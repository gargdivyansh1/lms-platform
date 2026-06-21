// frontend/src/pages/Student/Wishlist.jsx
import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  HeartIcon,
  BookOpenIcon,
  UserGroupIcon,
  TrashIcon,
  ArrowRightIcon,
  StarIcon,
  CheckCircleIcon,
  AcademicCapIcon
} from '@heroicons/react/24/outline';
import { HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const Wishlist = () => {
  const queryClient = useQueryClient();

  // Fetch wishlist with enrollment status
  const { data: wishlist, isLoading } = useQuery({
    queryKey: ['student-wishlist'],
    queryFn: async () => {
      const response = await api.get('/student/wishlist');
      return response.data;
    },
    retry: 1
  });

  // Fetch user's enrolled courses to check status
  const { data: enrollments } = useQuery({
    queryKey: ['my-enrollments'],
    queryFn: async () => {
      const response = await api.get('/enrollments/my-courses');
      return response.data;
    },
    retry: 1
  });

  // Create a set of enrolled course IDs for quick lookup
  const enrolledCourseIds = new Set(
    enrollments?.map(enrollment => enrollment.courseId) || []
  );

  const removeFromWishlistMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.delete(`/student/wishlist/${courseId}`);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-wishlist']);
      toast.success('Removed from wishlist');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to remove from wishlist');
    }
  });

  const enrollMutation = useMutation({
    mutationFn: async (courseId) => {
      const response = await api.post('/enrollments/enroll', { courseId });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-wishlist']);
      queryClient.invalidateQueries(['student-dashboard']);
      queryClient.invalidateQueries(['my-enrollments']);
      toast.success('Successfully enrolled!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to enroll');
    }
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
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <HeartSolidIcon className="h-6 w-6 text-red-500" />
            Wishlist
          </h1>
          <p className="text-slate-500 dark:text-slate-400">Courses you want to learn</p>
        </div>
        <Link
          to="/courses"
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <BookOpenIcon className="h-5 w-5" />
          Explore Courses
        </Link>
      </div>

      {wishlist?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <div className="flex justify-center mb-4">
            <div className="p-6 bg-red-50 dark:bg-red-900/20 rounded-full">
              <HeartIcon className="h-16 w-16 text-red-400" />
            </div>
          </div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            Your wishlist is empty
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-6 max-w-md mx-auto">
            Start adding courses you are interested in learning. Your wishlist helps you keep track of courses you want to take.
          </p>
          <Link
            to="/courses"
            className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
          >
            <BookOpenIcon className="h-5 w-5 mr-2" />
            Browse Courses
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {wishlist?.map((item) => {
            const isEnrolled = enrolledCourseIds.has(item.courseId);
            
            return (
              <div key={item.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all duration-200 border border-slate-100 dark:border-slate-700">
                <div className="relative h-48 bg-gradient-to-r from-blue-600 to-indigo-600 flex items-center justify-center overflow-hidden">
                  {item.course?.thumbnail ? (
                    <img src={item.course.thumbnail} alt={item.course.title} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-6xl font-bold text-white/20">
                      {item.course?.title?.[0]?.toUpperCase() || 'C'}
                    </span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent"></div>
                  
                  {/* Remove from wishlist button */}
                  <button
                    onClick={() => removeFromWishlistMutation.mutate(item.courseId)}
                    className="absolute top-3 right-3 p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition-colors shadow-lg hover:scale-110 transform duration-200"
                    title="Remove from wishlist"
                  >
                    <HeartSolidIcon className="h-5 w-5" />
                  </button>

                  {/* Enrollment badge */}
                  {isEnrolled && (
                    <div className="absolute bottom-3 left-3 px-3 py-1.5 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg">
                      <CheckCircleIcon className="h-3.5 w-3.5" />
                      Enrolled
                    </div>
                  )}
                </div>
                
                <div className="p-5">
                  <h3 className="text-lg font-semibold text-slate-900 dark:text-white mb-1 line-clamp-1">
                    {item.course?.title}
                  </h3>
                  <p className="text-sm text-slate-500 dark:text-slate-400 mb-2">
                    {item.course?.instructor}
                  </p>
                  <p className="text-sm text-slate-600 dark:text-slate-300 line-clamp-2 mb-3">
                    {item.course?.description}
                  </p>
                  
                  <div className="flex items-center justify-between text-sm text-slate-500 dark:text-slate-400 mb-4">
                    <span className="flex items-center gap-1">
                      <UserGroupIcon className="h-4 w-4" />
                      {item.course?._count?.enrolled || 0} students
                    </span>
                    <span className="flex items-center gap-1">
                      <StarIcon className="h-4 w-4 text-amber-500" />
                      {item.course?.rating || 'New'}
                    </span>
                  </div>
                  
                  <div className="flex gap-2">
                    {isEnrolled ? (
                      <Link
                        to={`/student/courses/${item.courseId}`}
                        className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                      >
                        <AcademicCapIcon className="h-4 w-4" />
                        Continue Learning
                      </Link>
                    ) : (
                      <button
                        onClick={() => enrollMutation.mutate(item.courseId)}
                        disabled={enrollMutation.isPending}
                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center justify-center gap-2 text-sm font-medium disabled:opacity-50 shadow-sm hover:shadow-md"
                      >
                        {enrollMutation.isPending ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Enrolling...
                          </>
                        ) : (
                          <>
                            <AcademicCapIcon className="h-4 w-4" />
                            Enroll Now
                          </>
                        )}
                      </button>
                    )}
                    <Link
                      to={`/courses/${item.courseId}`}
                      className="px-4 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all text-sm font-medium"
                    >
                      Details
                    </Link>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Wishlist;