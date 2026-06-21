// frontend/src/pages/CourseDetails.jsx
import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  BookOpenIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  CheckCircleIcon,
  PlayIcon,
  DocumentTextIcon,
  StarIcon,
  UsersIcon,
  ShareIcon,
  BookmarkIcon,
  CalendarIcon,
  HeartIcon,
  LockClosedIcon
} from '@heroicons/react/24/outline';
import { StarIcon as StarSolidIcon, HeartIcon as HeartSolidIcon } from '@heroicons/react/24/solid';

const CourseDetails = () => {
  const { id } = useParams();
  const { isAuthenticated, user, isInstructor } = useAuth();
  const queryClient = useQueryClient();
  const [enrolling, setEnrolling] = useState(false);
  const [expandedModule, setExpandedModule] = useState(null);

  // Fetch course details
  const { data: course, isLoading, refetch } = useQuery({
    queryKey: ['course', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}`);
      return response.data;
    },
  });

  // Check enrollment status
  const { data: enrollment } = useQuery({
    queryKey: ['enrollment', id],
    queryFn: async () => {
      if (!isAuthenticated || isInstructor) return null;
      const response = await api.get('/enrollments/my-courses');
      return response.data.find(e => e.courseId === id);
    },
    enabled: isAuthenticated && !isInstructor,
  });

  // Check wishlist status
  const { data: wishlistData, refetch: refetchWishlist } = useQuery({
    queryKey: ['wishlist-check', id],
    queryFn: async () => {
      if (!isAuthenticated) return { inWishlist: false };
      const response = await api.get(`/wishlist/check/${id}`);
      return response.data;
    },
    enabled: isAuthenticated,
  });

  // Fetch reviews
  const { data: reviews } = useQuery({
    queryKey: ['course-reviews', id],
    queryFn: async () => {
      const response = await api.get(`/courses/${id}/reviews`);
      return response.data;
    },
    enabled: !!course,
  });

  // Wishlist mutation
  const wishlistMutation = useMutation({
    mutationFn: async () => {
      if (wishlistData?.inWishlist) {
        await api.delete(`/wishlist/${id}`);
        return { action: 'removed' };
      } else {
        await api.post('/wishlist', { courseId: id });
        return { action: 'added' };
      }
    },
    onSuccess: (data) => {
      refetchWishlist();
      queryClient.invalidateQueries(['wishlist-check', id]);
      toast.success(
        data.action === 'added' 
          ? 'Course added to wishlist!' 
          : 'Course removed from wishlist!'
      );
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update wishlist');
    }
  });

  // Enroll mutation
  const handleEnroll = async () => {
    if (!isAuthenticated) {
      toast.error('Please login to enroll');
      return;
    }
    
    if (isInstructor) {
      toast.error('Instructors cannot enroll in courses');
      return;
    }

    setEnrolling(true);
    try {
      await api.post('/enrollments/enroll', { courseId: id });
      toast.success('Successfully enrolled!');
      refetch();
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to enroll');
    } finally {
      setEnrolling(false);
    }
  };

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  const isCourseInstructor = user?.name === course?.instructor;
  const isEnrolled = !!enrollment;
  const inWishlist = wishlistData?.inWishlist || false;

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!course) {
    return (
      <div className="text-center py-16">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Course not found
        </h2>
        <p className="text-slate-500 dark:text-slate-400 mb-6">
          The course you are looking for does not exist or has been removed.
        </p>
        <Link to="/courses" className="inline-flex items-center px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all">
          <ArrowLeftIcon className="h-5 w-5 mr-2" />
          Back to courses
        </Link>
      </div>
    );
  }

  const averageRating = reviews?.averageRating || 0;
  const totalReviews = reviews?.totalReviews || 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">

      {/* Course Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden">
        <div className="relative h-64 md:h-80 lg:h-96 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden">
          {course.thumbnail ? (
            <img
              src={course.thumbnail}
              alt={course.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="text-center">
              <span className="text-8xl font-bold text-white/20">
                {course.title?.[0]?.toUpperCase()}
              </span>
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/20 to-transparent"></div>
          
          {/* Course Badges */}
          <div className="absolute top-4 left-4 flex flex-wrap gap-2">
            {course.featured && (
              <span className="px-3 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg">
                <StarSolidIcon className="h-3 w-3" />
                Featured
              </span>
            )}
            {isCourseInstructor && (
              <span className="px-3 py-1 bg-blue-500 text-white rounded-lg text-xs font-medium shadow-lg">
                Your Course
              </span>
            )}
            {isEnrolled && (
              <span className="px-3 py-1 bg-emerald-500 text-white rounded-lg text-xs font-medium flex items-center gap-1 shadow-lg">
                <CheckCircleIcon className="h-3 w-3" />
                Enrolled
              </span>
            )}
          </div>

          {/* Course Info Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-8">
            <div className="max-w-4xl">
              <h1 className="text-2xl md:text-3xl lg:text-4xl font-bold text-white mb-2">
                {course.title}
              </h1>
              <div className="flex flex-wrap items-center gap-4 text-white/90 text-sm">
                <span className="flex items-center gap-1.5">
                  <UserGroupIcon className="h-4 w-4" />
                  {course.instructor}
                </span>
                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                  <UsersIcon className="h-4 w-4" />
                  {course._count?.enrolled || 0} students
                </span>
                <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                <span className="flex items-center gap-1.5">
                  <BookOpenIcon className="h-4 w-4" />
                  {course.modules?.length || 0} modules
                </span>
                {averageRating > 0 && (
                  <>
                    <span className="w-1 h-1 bg-white/40 rounded-full"></span>
                    <span className="flex items-center gap-1.5">
                      <StarSolidIcon className="h-4 w-4 text-amber-400" />
                      {averageRating.toFixed(1)} ({totalReviews} reviews)
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Course Actions */}
        <div className="p-6 border-b border-slate-200 dark:border-slate-700 flex flex-wrap items-center justify-between gap-4">
          <div className="flex flex-wrap items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <CalendarIcon className="h-4 w-4" />
              <span>Created: {new Date(course.createdAt).toLocaleDateString()}</span>
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-600 dark:text-slate-400">
              <ClockIcon className="h-4 w-4" />
              <span>Updated: {new Date(course.updatedAt).toLocaleDateString()}</span>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {/* Wishlist Button */}
            {isAuthenticated && !isCourseInstructor && (
              <button
                onClick={() => wishlistMutation.mutate()}
                disabled={wishlistMutation.isPending}
                className={`p-2.5 rounded-xl border transition-all flex items-center gap-2 ${
                  inWishlist
                    ? 'border-red-200 dark:border-red-800 bg-red-50 dark:bg-red-900/20 text-red-600 dark:text-red-400'
                    : 'border-slate-200 dark:border-slate-700 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-700'
                }`}
              >
                {inWishlist ? (
                  <HeartSolidIcon className="h-5 w-5 text-red-500" />
                ) : (
                  <HeartIcon className="h-5 w-5" />
                )}
                <span className="text-sm font-medium hidden sm:inline">
                  {inWishlist ? 'In Wishlist' : 'Add to Wishlist'}
                </span>
              </button>
            )}

            {/* Enroll/Manage Buttons */}
            {!isInstructor && !isCourseInstructor && (
              !isEnrolled ? (
                <button
                  onClick={handleEnroll}
                  disabled={enrolling}
                  className="px-6 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 flex items-center gap-2"
                >
                  <AcademicCapIcon className="h-5 w-5" />
                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                </button>
              ) : (
                <span className="px-6 py-2.5 bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400 rounded-xl flex items-center gap-2 font-medium">
                  <CheckCircleIcon className="h-5 w-5" />
                  Enrolled
                </span>
              )
            )}
            {isCourseInstructor && (
              <Link
                to={`/instructor/courses/${course.id}`}
                className="px-6 py-2.5 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 transition-all flex items-center gap-2"
              >
                <DocumentTextIcon className="h-5 w-5" />
                Manage Course
              </Link>
            )}
          </div>
        </div>

        {/* Course Content */}
        <div className="p-6 space-y-8">
          {/* Description */}
          <div>
            <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-3">
              About This Course
            </h2>
            <p className="text-slate-600 dark:text-slate-300 leading-relaxed">
              {course.description}
            </p>
          </div>

          {/* Course Stats */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {course.modules?.length || 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Total Modules</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                {course._count?.enrolled || 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Students Enrolled</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {course._count?.assignments || 0}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Assignments</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl p-4 text-center">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {averageRating > 0 ? averageRating.toFixed(1) : 'N/A'}
              </div>
              <div className="text-sm text-slate-500 dark:text-slate-400">Rating</div>
            </div>
          </div>

          {/* Modules - Video access restricted */}
          {course.modules && course.modules.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Course Modules
              </h2>
              <div className="space-y-3">
                {course.modules.map((module, index) => {
                  const isLocked = !isEnrolled && !isCourseInstructor;
                  return (
                    <div
                      key={module.id}
                      className={`border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden hover:shadow-md transition-all ${
                        isLocked ? 'opacity-75' : ''
                      }`}
                    >
                      <button
                        onClick={() => toggleModule(module.id)}
                        className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                        disabled={isLocked}
                      >
                        <div className="flex items-center gap-3">
                          <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-sm ${
                            isLocked
                              ? 'bg-slate-100 dark:bg-slate-700 text-slate-400'
                              : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                          }`}>
                            {index + 1}
                          </span>
                          <div className="text-left">
                            <h3 className="font-medium text-slate-900 dark:text-white">
                              {module.title}
                            </h3>
                            <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                              {module.content}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-3">
                          {isLocked && (
                            <LockClosedIcon className="h-4 w-4 text-slate-400" />
                          )}
                          {module.videoUrl && !isLocked && (
                            <PlayIcon className="h-4 w-4 text-slate-400" />
                          )}
                        </div>
                      </button>
                      {expandedModule === module.id && (
                        <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                          {isLocked ? (
                            <div className="text-center py-6">
                              <LockClosedIcon className="h-12 w-12 text-slate-400 mx-auto mb-3" />
                              <p className="text-slate-600 dark:text-slate-400 font-medium">
                                This module is locked
                              </p>
                              <p className="text-sm text-slate-500 dark:text-slate-500 mt-1">
                                {isAuthenticated 
                                  ? 'Enroll in this course to access all modules and videos' 
                                  : 'Please login and enroll to access this content'}
                              </p>
                              {!isAuthenticated && (
                                <Link
                                  to="/login"
                                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                                >
                                  Login to Enroll
                                </Link>
                              )}
                              {isAuthenticated && !isEnrolled && (
                                <button
                                  onClick={handleEnroll}
                                  disabled={enrolling}
                                  className="inline-block mt-4 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                                >
                                  {enrolling ? 'Enrolling...' : 'Enroll Now'}
                                </button>
                              )}
                            </div>
                          ) : (
                            <div className="space-y-3">
                              <p className="text-slate-700 dark:text-slate-300">
                                {module.content}
                              </p>
                              {module.videoUrl && (
                                <div className="flex items-center gap-2">
                                  <PlayIcon className="h-4 w-4 text-blue-600" />
                                  <a
                                    href={module.videoUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="text-blue-600 hover:underline text-sm"
                                  >
                                    Watch Video Lecture
                                  </a>
                                </div>
                              )}
                              {isEnrolled && !isInstructor && (
                                <Link
                                  to={`/student/courses/${course.id}`}
                                  className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm"
                                >
                                  <BookOpenIcon className="h-4 w-4 mr-2" />
                                  Start Module
                                </Link>
                              )}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* Reviews Section */}
          {reviews && reviews.reviews && reviews.reviews.length > 0 && (
            <div>
              <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
                Student Reviews
              </h2>
              <div className="space-y-4">
                {reviews.reviews.slice(0, 3).map((review) => (
                  <div key={review.id} className="border-b border-slate-200 dark:border-slate-700 pb-4 last:border-0">
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-10 h-10 rounded-full bg-blue-600 flex items-center justify-center text-white font-semibold">
                        {review.user?.name?.[0]?.toUpperCase() || 'U'}
                      </div>
                      <div>
                        <p className="font-medium text-slate-900 dark:text-white">
                          {review.user?.name || 'Anonymous'}
                        </p>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <StarIcon
                              key={i}
                              className={`h-4 w-4 ${
                                i < review.rating
                                  ? 'text-amber-400 fill-current'
                                  : 'text-slate-300 dark:text-slate-600'
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                    {review.comment && (
                      <p className="text-sm text-slate-600 dark:text-slate-300">
                        {review.comment}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Enroll CTA for non-enrolled users */}
          {!isInstructor && !isCourseInstructor && !isEnrolled && (
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-2xl p-6 text-center border border-blue-100 dark:border-blue-900/30">
              <h3 className="text-lg font-bold text-slate-900 dark:text-white mb-2">
                Ready to start learning?
              </h3>
              <p className="text-slate-600 dark:text-slate-300 mb-4">
                Join {course._count?.enrolled || 0} other students in this course
              </p>
              <button
                onClick={handleEnroll}
                disabled={enrolling}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg disabled:opacity-50 inline-flex items-center gap-2"
              >
                <AcademicCapIcon className="h-5 w-5" />
                {enrolling ? 'Enrolling...' : 'Enroll Now'}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CourseDetails;