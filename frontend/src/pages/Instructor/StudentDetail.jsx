import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import {
  ArrowLeftIcon,
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  BookOpenIcon,
  CheckCircleIcon,
  ClockIcon,
  DocumentTextIcon,
  ChartBarIcon,
  TrophyIcon,
  CalendarIcon,
  UserGroupIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';
import { CheckCircleIcon as CheckCircleSolid } from '@heroicons/react/24/solid';

const StudentDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [selectedCourse, setSelectedCourse] = useState('all');

  // Fetch student details
  const { data: student, isLoading: studentLoading } = useQuery({
    queryKey: ['student-detail', id],
    queryFn: async () => {
      const response = await api.get(`/instructor/students/${id}/progress`);
      return response.data;
    },
    retry: 1
  });

  // Fetch student's assignments
  const { data: assignments, isLoading: assignmentsLoading } = useQuery({
    queryKey: ['student-assignments', id],
    queryFn: async () => {
      const response = await api.get(`/instructor/students/${id}/assignments`);
      return response.data;
    },
    retry: 1
  });

  if (studentLoading || assignmentsLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!student) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Student not found
        </h2>
        <button
          onClick={() => navigate('/instructor/students')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to students
        </button>
      </div>
    );
  }

  const studentData = student.student || student;
  const courses = student.courses || [];
  const overallProgress = courses.reduce((acc, c) => acc + c.progress, 0) / (courses.length || 1);

  // Filter assignments by course
  const filteredAssignments = selectedCourse === 'all' 
    ? assignments 
    : assignments?.filter(a => a.courseId === selectedCourse);

  // Calculate assignment stats
  const totalAssignments = assignments?.length || 0;
  const gradedAssignments = assignments?.filter(a => a.grade !== null).length || 0;
  const pendingAssignments = assignments?.filter(a => a.grade === null && a.submittedAt).length || 0;
  const notSubmitted = assignments?.filter(a => !a.submittedAt).length || 0;
  const averageGrade = assignments?.filter(a => a.grade !== null).reduce((acc, a) => acc + a.grade, 0) / (gradedAssignments || 1);

  const getStatusBadge = (assignment) => {
    if (assignment.grade !== null) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-50 dark:bg-emerald-900/20 text-emerald-600 dark:text-emerald-400">
          <CheckCircleIcon className="h-3 w-3 mr-1" />
          Graded
        </span>
      );
    } else if (assignment.submittedAt) {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-50 dark:bg-amber-900/20 text-amber-600 dark:text-amber-400">
          <ClockIcon className="h-3 w-3 mr-1" />
          Pending Review
        </span>
      );
    } else {
      return (
        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 dark:bg-slate-700 text-slate-600 dark:text-slate-300">
          <ClockIcon className="h-3 w-3 mr-1" />
          Not Submitted
        </span>
      );
    }
  };

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <button
        onClick={() => navigate('/instructor/students')}
        className="inline-flex items-center text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors group"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to Students
      </button>

      {/* Student Profile Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-start gap-6">
          {/* Avatar */}
          <div className="flex-shrink-0">
            <div className="w-24 h-24 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-3xl font-bold shadow-lg">
              {studentData.avatar ? (
                <img src={studentData.avatar} alt={studentData.name} className="w-full h-full rounded-full object-cover" />
              ) : (
                studentData.name?.[0]?.toUpperCase() || 'S'
              )}
            </div>
          </div>

          {/* Student Info */}
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white">
              {studentData.name || 'Unknown Student'}
            </h1>
            <div className="flex flex-wrap items-center gap-3 mt-1">
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <EnvelopeIcon className="h-4 w-4" />
                {studentData.email || 'No email'}
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <UserGroupIcon className="h-4 w-4" />
                {courses.length} course{courses.length !== 1 ? 's' : ''} enrolled
              </span>
              <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
              <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                <CalendarIcon className="h-4 w-4" />
                Joined {new Date(studentData.createdAt).toLocaleDateString()}
              </span>
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-32 bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                  <div
                    className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                    style={{ width: `${Math.round(overallProgress)}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                  {Math.round(overallProgress)}% Overall Progress
                </span>
              </div>
              <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                overallProgress === 100 
                  ? 'bg-emerald-100 dark:bg-emerald-900/20 text-emerald-700 dark:text-emerald-300'
                  : 'bg-blue-100 dark:bg-blue-900/20 text-blue-700 dark:text-blue-300'
              }`}>
                {overallProgress === 100 ? 'Completed All Courses' : 'Active Learner'}
              </span>
            </div>
          </div>

          {/* Quick Stats */}
          <div className="flex flex-wrap gap-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
                {courses.filter(c => c.completed).length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Completed</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
                {courses.filter(c => !c.completed && c.progress > 0).length}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">In Progress</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-xl px-4 py-2 text-center min-w-[80px]">
              <div className="text-2xl font-bold text-purple-600 dark:text-purple-400">
                {gradedAssignments}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Graded</div>
            </div>
          </div>
        </div>
      </div>

      {/* Course Progress Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <h2 className="text-lg font-bold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
          <BookOpenIcon className="h-5 w-5 text-blue-600" />
          Course Progress
        </h2>
        {courses.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            Student is not enrolled in any of your courses.
          </p>
        ) : (
          <div className="space-y-4">
            {courses.map((course) => (
              <div key={course.courseId || course.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <h4 className="font-medium text-slate-900 dark:text-white">
                      {course.title || course.course?.title}
                    </h4>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      Progress: {course.progress || 0}%
                    </p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-32">
                      <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2">
                        <div
                          className={`h-2 rounded-full transition-all duration-500 ${
                            course.completed ? 'bg-emerald-500' : 'bg-blue-600'
                          }`}
                          style={{ width: `${course.progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <span className={`text-xs font-medium ${
                      course.completed 
                        ? 'text-emerald-600 dark:text-emerald-400'
                        : 'text-amber-600 dark:text-amber-400'
                    }`}>
                      {course.completed ? 'Completed' : 'In Progress'}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Assignments Section */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
        <div className="flex flex-wrap items-center justify-between gap-4 mb-4">
          <h2 className="text-lg font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <DocumentTextIcon className="h-5 w-5 text-blue-600" />
            Assignments
          </h2>
          <div className="flex flex-wrap items-center gap-3">
            <select
              value={selectedCourse}
              onChange={(e) => setSelectedCourse(e.target.value)}
              className="px-3 py-1.5 border border-slate-300 dark:border-slate-600 rounded-lg text-sm dark:bg-slate-700 dark:text-white"
            >
              <option value="all">All Courses</option>
              {courses.map((course) => (
                <option key={course.courseId || course.id} value={course.courseId || course.id}>
                  {course.title || course.course?.title}
                </option>
              ))}
            </select>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {filteredAssignments?.length || 0} assignments
            </span>
          </div>
        </div>

        {/* Assignment Stats */}
        {filteredAssignments && filteredAssignments.length > 0 && (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-4">
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">
                {gradedAssignments}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Graded</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-amber-600 dark:text-amber-400">
                {pendingAssignments}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Pending Review</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-red-600 dark:text-red-400">
                {notSubmitted}
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Not Submitted</div>
            </div>
            <div className="bg-slate-50 dark:bg-slate-700/50 rounded-lg p-3 text-center">
              <div className="text-xl font-bold text-purple-600 dark:text-purple-400">
                {averageGrade ? averageGrade.toFixed(1) : 'N/A'}%
              </div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Average Grade</div>
            </div>
          </div>
        )}

        {filteredAssignments?.length === 0 ? (
          <p className="text-center text-slate-500 dark:text-slate-400 py-8">
            No assignments found for this student.
          </p>
        ) : (
          <div className="space-y-3">
            {filteredAssignments.map((assignment) => (
              <div key={assignment.id} className="border border-slate-200 dark:border-slate-700 rounded-xl p-4 hover:shadow-md transition-shadow">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <DocumentTextIcon className="h-4 w-4 text-blue-600 flex-shrink-0" />
                      <h4 className="font-medium text-slate-900 dark:text-white truncate">
                        {assignment.title}
                      </h4>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 truncate">
                      {assignment.course?.title || assignment.courseTitle || 'Unknown Course'}
                    </p>
                    {assignment.submittedAt && (
                      <p className="text-xs text-slate-400 dark:text-slate-500">
                        Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}
                      </p>
                    )}
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(assignment)}
                    {assignment.grade !== null && (
                      <span className={`text-sm font-bold ${
                        assignment.grade >= 70 ? 'text-emerald-600 dark:text-emerald-400' :
                        assignment.grade >= 50 ? 'text-amber-600 dark:text-amber-400' :
                        'text-red-600 dark:text-red-400'
                      }`}>
                        {assignment.grade}%
                      </span>
                    )}
                    {assignment.fileUrl && (
                      <a
                        href={`${import.meta.env.VITE_API_URL}${assignment.fileUrl}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="p-1.5 text-slate-400 hover:text-blue-600 transition-colors"
                        title="View submission"
                      >
                        <DocumentTextIcon className="h-4 w-4" />
                      </a>
                    )}
                  </div>
                </div>
                {assignment.feedback && (
                  <div className="mt-2 p-2 bg-slate-50 dark:bg-slate-700/30 rounded-lg">
                    <p className="text-sm text-slate-600 dark:text-slate-400">
                      <span className="font-medium">Feedback:</span> {assignment.feedback}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default StudentDetail;