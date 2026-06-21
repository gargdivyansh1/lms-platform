import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import toast from 'react-hot-toast';
import {
  PlusIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  EyeIcon,
  DocumentTextIcon,
  PencilIcon,
  TrashIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserIcon,
  AcademicCapIcon,
  ArrowPathIcon
} from '@heroicons/react/24/outline';

const InstructorAssignments = () => {
  const [selectedCourse, setSelectedCourse] = useState('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [expandedAssignment, setExpandedAssignment] = useState(null);
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    dueDate: '',
    maxScore: 100
  });
  const queryClient = useQueryClient();

  // Fetch instructor's courses
  const { data: courses, isLoading: coursesLoading } = useQuery({
    queryKey: ['instructor-courses'],
    queryFn: async () => {
      const response = await api.get('/instructor/courses');
      return response.data;
    }
  });

  // Fetch assignments with proper student data
  const { data: assignments, isLoading, refetch } = useQuery({
    queryKey: ['instructor-assignments', selectedCourse],
    queryFn: async () => {
      if (selectedCourse === 'all') {
        // Get all assignments from all courses
        const allAssignments = [];
        const courseData = await api.get('/instructor/courses');
        
        for (const course of courseData.data) {
          // Get students for this course
          const studentsResponse = await api.get(`/instructor/courses/${course.id}/students`);
          const students = studentsResponse.data;
          
          for (const student of students) {
            // Get assignments for each student
            const assignmentResponse = await api.get(`/instructor/students/${student.user.id}/assignments`);
            const studentAssignments = assignmentResponse.data.map(a => ({
              ...a,
              courseTitle: course.title,
              courseId: course.id,
              studentName: student.user.name,
              studentEmail: student.user.email,
              studentAvatar: student.user.avatar
            }));
            allAssignments.push(...studentAssignments);
          }
        }
        return allAssignments;
      } else {
        // Get assignments for specific course
        const studentsResponse = await api.get(`/instructor/courses/${selectedCourse}/students`);
        const students = studentsResponse.data;
        const allAssignments = [];
        
        for (const student of students) {
          const assignmentResponse = await api.get(`/instructor/students/${student.user.id}/assignments`);
          const studentAssignments = assignmentResponse.data.map(a => ({
            ...a,
            courseTitle: student.course?.title || 'Unknown Course',
            courseId: selectedCourse,
            studentName: student.user.name,
            studentEmail: student.user.email,
            studentAvatar: student.user.avatar
          }));
          allAssignments.push(...studentAssignments);
        }
        return allAssignments;
      }
    },
    enabled: !!courses,
    retry: 1
  });

  // Create assignment mutation
  const createAssignmentMutation = useMutation({
    mutationFn: async (data) => {
      const response = await api.post(`/instructor/courses/${selectedCourse}/assignments`, data);
      return response.data;
    },
    onSuccess: (data) => {
      // Invalidate queries to refresh the list
      queryClient.invalidateQueries(['instructor-assignments']);
      queryClient.invalidateQueries(['instructor-courses']);
      
      // Show success message with count
      if (data.count) {
        toast.success(`Assignment created for ${data.count} students!`);
      } else {
        toast.success('Assignment created successfully!');
      }
      
      // Reset form
      setShowCreateForm(false);
      setFormData({ title: '', description: '', dueDate: '', maxScore: 100 });
      
      // Force refetch
      setTimeout(() => {
        refetch();
      }, 500);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to create assignment');
    }
  });

  // Grade assignment mutation
  const gradeAssignmentMutation = useMutation({
    mutationFn: async ({ assignmentId, grade, feedback }) => {
      const response = await api.put(`/instructor/submissions/${assignmentId}/grade`, { grade, feedback });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['instructor-assignments']);
      toast.success('Assignment graded successfully');
      setExpandedAssignment(null);
      refetch();
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to grade assignment');
    }
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (selectedCourse === 'all') {
      toast.error('Please select a specific course');
      return;
    }
    createAssignmentMutation.mutate(formData);
  };

  const handleGrade = (assignmentId, grade, feedback) => {
    if (grade === undefined || grade === null || grade === '') {
      toast.error('Please enter a grade');
      return;
    }
    gradeAssignmentMutation.mutate({ assignmentId, grade: parseFloat(grade), feedback });
  };

  const toggleExpand = (id) => {
    setExpandedAssignment(expandedAssignment === id ? null : id);
  };

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
          <XCircleIcon className="h-3 w-3 mr-1" />
          Not Submitted
        </span>
      );
    }
  };

  if (isLoading || coursesLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">

      {/* Statistics */}
      {assignments?.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <DocumentTextIcon className="h-6 w-6 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Assignments</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">{assignments.length}</p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircleIcon className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Graded</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {assignments.filter(a => a.grade !== null).length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <ClockIcon className="h-6 w-6 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Pending Review</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {assignments.filter(a => a.grade === null && a.submittedAt).length}
              </p>
            </div>
          </div>
          <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 flex items-center gap-4">
            <div className="p-3 bg-red-100 dark:bg-red-900/20 rounded-lg">
              <XCircleIcon className="h-6 w-6 text-red-600 dark:text-red-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Not Submitted</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {assignments.filter(a => !a.submittedAt).length}
              </p>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400">Manage and grade student assignments</p>
        </div>
        <button
          onClick={() => setShowCreateForm(!showCreateForm)}
          className="px-4 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <PlusIcon className="h-5 w-5" />
          Create Assignment
        </button>
      </div>

      {/* Create Assignment Form */}
      {showCreateForm && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6 border border-slate-200 dark:border-slate-700">
          <h2 className="text-lg font-semibold text-slate-900 dark:text-white mb-4">
            Create New Assignment
          </h2>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Select Course *
              </label>
              <select
                value={selectedCourse}
                onChange={(e) => setSelectedCourse(e.target.value)}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                required
              >
                <option value="all">Select a course</option>
                {courses?.map(course => (
                  <option key={course.id} value={course.id}>{course.title}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Assignment Title *
              </label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                Description
              </label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                rows={3}
                className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
              />
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Due Date
                </label>
                <input
                  type="datetime-local"
                  value={formData.dueDate}
                  onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Max Score
                </label>
                <input
                  type="number"
                  value={formData.maxScore}
                  onChange={(e) => setFormData({ ...formData, maxScore: parseInt(e.target.value) })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                  min="0"
                />
              </div>
            </div>
            <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
              <button
                type="submit"
                disabled={createAssignmentMutation.isPending}
                className="px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
              >
                {createAssignmentMutation.isPending ? 'Creating...' : 'Create Assignment'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowCreateForm(false);
                  setFormData({ title: '', description: '', dueDate: '', maxScore: 100 });
                }}
                className="px-6 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Filter */}
      <div className="flex flex-wrap items-center gap-4">
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
        <span className="text-sm text-slate-500 dark:text-slate-400">
          {assignments?.length || 0} assignments
        </span>
        <button
          onClick={() => refetch()}
          className="p-2.5 text-slate-400 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-xl transition-all"
        >
          <ArrowPathIcon className="h-5 w-5" />
        </button>
      </div>

      {assignments?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm">
          <div className="text-6xl mb-4">📝</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Assignments Yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            Create assignments for your students to submit.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {assignments?.map((assignment) => (
            <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-md transition-all border border-slate-200 dark:border-slate-700">
              {/* Assignment Header */}
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => toggleExpand(assignment.id)}
              >
                <div className="flex flex-wrap items-center justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <div>
                        <h3 className="font-semibold text-slate-900 dark:text-white truncate">
                          {assignment.title}
                        </h3>
                        <div className="flex flex-wrap items-center gap-3 text-sm text-slate-500 dark:text-slate-400">
                          <span>{assignment.courseTitle}</span>
                          <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                          <span className="flex items-center gap-1">
                            <UserIcon className="h-3 w-3" />
                            {assignment.studentName || 'Unknown Student'}
                          </span>
                        </div>
                      </div>
                    </div>
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
                    <button className="p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300">
                      {expandedAssignment === assignment.id ? (
                        <ChevronUpIcon className="h-5 w-5" />
                      ) : (
                        <ChevronDownIcon className="h-5 w-5" />
                      )}
                    </button>
                  </div>
                </div>
              </div>

              {/* Expanded Details */}
              {expandedAssignment === assignment.id && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/30">
                  <div className="space-y-4">
                    {/* Assignment Details */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">
                          {assignment.description || 'No description provided'}
                        </p>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Student:</span>
                          <span className="font-medium text-slate-700 dark:text-slate-300">
                            {assignment.studentName || 'Unknown Student'}
                          </span>
                          {assignment.studentEmail && (
                            <span className="text-slate-400 text-xs">({assignment.studentEmail})</span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-sm">
                          <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                          <span className="text-slate-700 dark:text-slate-300">
                            {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleString() : 'Not submitted'}
                          </span>
                        </div>
                        {assignment.fileUrl && (
                          <div className="flex items-center gap-2 text-sm">
                            <span className="text-slate-500 dark:text-slate-400">File:</span>
                            <a
                              href={`${import.meta.env.VITE_API_URL}${assignment.fileUrl}`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline flex items-center gap-1"
                            >
                              <EyeIcon className="h-4 w-4" />
                              View Submission
                            </a>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Grading Section */}
                    {assignment.submittedAt && assignment.grade === null && (
                      <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                        <h4 className="text-sm font-medium text-blue-700 dark:text-blue-300 mb-3">
                          Grade Assignment
                        </h4>
                        <div className="flex flex-wrap items-end gap-4">
                          <div className="flex-1 min-w-[150px]">
                            <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Grade (%)
                            </label>
                            <input
                              type="number"
                              min="0"
                              max="100"
                              placeholder="Enter grade"
                              className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                              id={`grade-${assignment.id}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const grade = e.target.value;
                                  const feedback = document.getElementById(`feedback-${assignment.id}`)?.value || '';
                                  handleGrade(assignment.id, grade, feedback);
                                }
                              }}
                            />
                          </div>
                          <div className="flex-1 min-w-[200px]">
                            <label className="block text-xs font-medium text-blue-700 dark:text-blue-300 mb-1">
                              Feedback
                            </label>
                            <input
                              type="text"
                              placeholder="Provide feedback"
                              className="w-full px-4 py-2 border border-blue-300 dark:border-blue-700 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-800 dark:text-white"
                              id={`feedback-${assignment.id}`}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  const grade = document.getElementById(`grade-${assignment.id}`)?.value || '';
                                  const feedback = e.target.value;
                                  handleGrade(assignment.id, grade, feedback);
                                }
                              }}
                            />
                          </div>
                          <button
                            onClick={() => {
                              const grade = document.getElementById(`grade-${assignment.id}`)?.value || '';
                              const feedback = document.getElementById(`feedback-${assignment.id}`)?.value || '';
                              handleGrade(assignment.id, grade, feedback);
                            }}
                            disabled={gradeAssignmentMutation.isPending}
                            className="px-6 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-50 shadow-sm hover:shadow-md"
                          >
                            {gradeAssignmentMutation.isPending ? 'Grading...' : 'Submit Grade'}
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Show grade if already graded */}
                    {assignment.grade !== null && (
                      <div className="p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-xl border border-emerald-200 dark:border-emerald-800">
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
                            {assignment.grade}%
                          </div>
                          <div>
                            <p className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Graded</p>
                            {assignment.feedback && (
                              <p className="text-sm text-emerald-600 dark:text-emerald-400">
                                Feedback: {assignment.feedback}
                              </p>
                            )}
                          </div>
                        </div>
                      </div>
                    )}

                    {/* Not submitted message */}
                    {!assignment.submittedAt && (
                      <div className="p-4 bg-slate-100 dark:bg-slate-700/50 rounded-xl text-center">
                        <XCircleIcon className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                        <p className="text-sm text-slate-500 dark:text-slate-400">
                          Student has not submitted this assignment yet
                        </p>
                      </div>
                    )}
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

export default InstructorAssignments;