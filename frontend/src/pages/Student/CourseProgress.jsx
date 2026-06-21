// frontend/src/pages/Student/CourseProgress.jsx
import React, { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  CheckCircleIcon,
  ClockIcon,
  PlayIcon,
  DocumentTextIcon,
  TrophyIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  UserGroupIcon,
  BookOpenIcon,
  DocumentArrowDownIcon
} from '@heroicons/react/24/outline';

const CourseProgress = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [expandedModule, setExpandedModule] = useState(null);
  const [completedModuleIds, setCompletedModuleIds] = useState(new Set());

  const { data: courseData, isLoading, refetch } = useQuery({
    queryKey: ['student-course-progress', id],
    queryFn: async () => {
      const response = await api.get(`/student/courses/${id}/progress`);
      // Initialize completed module IDs from the response
      if (response.data && response.data.modules) {
        const completedIds = response.data.modules
          .filter(m => m.completed)
          .map(m => m.id);
        setCompletedModuleIds(new Set(completedIds));
      }
      return response.data;
    },
    retry: 1
  });

  const completeModuleMutation = useMutation({
    mutationFn: async (moduleId) => {
      const response = await api.post(`/student/courses/${id}/complete-module`, { moduleId });
      return response.data;
    },
    onSuccess: (data, variables) => {
      // Add the completed module ID to the set
      setCompletedModuleIds(prev => new Set([...prev, variables]));
      // Invalidate and refetch queries
      queryClient.invalidateQueries(['student-course-progress', id]);
      queryClient.invalidateQueries(['student-dashboard']);
      refetch();
      toast.success('Module completed successfully!');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to complete module');
    }
  });

  const toggleModule = (moduleId) => {
    setExpandedModule(expandedModule === moduleId ? null : moduleId);
  };

  // Check if a module is completed
  const isModuleCompleted = (moduleId) => {
    return completedModuleIds.has(moduleId);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!courseData) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
          Course not found
        </h2>
        <button
          onClick={() => navigate('/student/courses')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to my courses
        </button>
      </div>
    );
  }

  const { course, progress, modules, assignments } = courseData;

  return (
    <div className="space-y-6">
      <button
        onClick={() => navigate('/student/courses')}
        className="inline-flex items-center text-blue-600 hover:underline group"
      >
        <ArrowLeftIcon className="h-4 w-4 mr-2 group-hover:-translate-x-1 transition-transform" />
        Back to My Courses
      </button>

      {/* Course Header */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
              {course.title}
            </h1>
            <p className="text-slate-600 dark:text-slate-300 mb-2">
              {course.description}
            </p>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Instructor: {course.instructor}
            </p>
          </div>
          <div className="bg-blue-50 dark:bg-blue-900/20 rounded-xl p-4 text-center min-w-[150px]">
            <div className="text-3xl font-bold text-blue-600 dark:text-blue-400">
              {progress.overall}%
            </div>
            <div className="text-sm text-slate-500 dark:text-slate-400">Overall Progress</div>
            <div className="w-full bg-slate-200 dark:bg-slate-700 rounded-full h-2 mt-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${progress.overall}%` }}
              />
            </div>
          </div>
        </div>

        {progress.completed && (
        <div className="mt-4 p-4 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg flex items-center gap-3">
          <TrophyIcon className="h-8 w-8 text-emerald-500" />
          <div>
            <h4 className="font-semibold text-emerald-700 dark:text-emerald-300">Course Completed!</h4>
            <p className="text-sm text-emerald-600 dark:text-emerald-400">
              Congratulations! You have completed all modules.
            </p>
            <button
              onClick={async () => {
                try {
                  const response = await api.post(`/student/courses/${id}/certificate`);
                  toast.success('Certificate generated!');
                  if (response.data.downloadUrl) {
                    window.open(response.data.downloadUrl, '_blank');
                  }
                } catch (error) {
                  toast.error(error.response?.data?.error || 'Failed to generate certificate');
                }
              }}
              className="mt-2 px-4 py-1.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm flex items-center gap-2"
            >
              <DocumentArrowDownIcon className="h-4 w-4" />
              Download Certificate
            </button>
          </div>
        </div>
        )}
      </div>

      {/* Stats Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-blue-600 dark:text-blue-400">
            {progress.modulesCompleted || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Modules Completed</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-emerald-600 dark:text-emerald-400">
            {progress.totalModules || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Total Modules</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-indigo-600 dark:text-indigo-400">
            {assignments?.length || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Assignments</div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 text-center">
          <div className="text-2xl font-bold text-amber-600 dark:text-amber-400">
            {assignments?.filter(a => a.grade !== null).length || 0}
          </div>
          <div className="text-sm text-slate-500 dark:text-slate-400">Graded</div>
        </div>
      </div>

      {/* Modules */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-4">
          Course Modules
        </h2>
        <div className="space-y-3">
          {modules?.map((module, index) => {
            const isCompleted = isModuleCompleted(module.id) || module.completed;
            
            return (
              <div 
                key={module.id} 
                className={`border rounded-xl overflow-hidden transition-all duration-200 ${
                  isCompleted 
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/50 dark:bg-emerald-900/10' 
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <button
                  onClick={() => toggleModule(module.id)}
                  className="w-full flex items-center justify-between p-4 hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                >
                  <div className="flex items-center gap-3">
                    <span className={`w-8 h-8 flex items-center justify-center rounded-lg font-semibold text-sm ${
                      isCompleted
                        ? 'bg-emerald-100 dark:bg-emerald-900/40 text-emerald-600 dark:text-emerald-400'
                        : 'bg-blue-100 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400'
                    }`}>
                      {index + 1}
                    </span>
                    <div className="text-left">
                      <h3 className={`font-medium ${
                        isCompleted ? 'text-emerald-700 dark:text-emerald-300' : 'text-slate-900 dark:text-white'
                      }`}>
                        {module.title}
                      </h3>
                      <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                        {module.content}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    {isCompleted ? (
                      <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 text-sm font-medium">
                        <CheckCircleIcon className="h-5 w-5" />
                        Completed
                      </span>
                    ) : (
                      <ClockIcon className="h-5 w-5 text-slate-400" />
                    )}
                    {expandedModule === module.id ? (
                      <ChevronUpIcon className="h-5 w-5 text-slate-400" />
                    ) : (
                      <ChevronDownIcon className="h-5 w-5 text-slate-400" />
                    )}
                  </div>
                </button>
                
                {expandedModule === module.id && (
                  <div className="p-4 bg-slate-50 dark:bg-slate-700/30 border-t border-slate-200 dark:border-slate-700">
                    <div className="space-y-4">
                      <p className="text-slate-700 dark:text-slate-300">{module.content}</p>
                      
                      {module.videoUrl && (
                        <div className="flex items-center gap-2 text-sm text-blue-600">
                          <PlayIcon className="h-4 w-4" />
                          <a href={module.videoUrl} target="_blank" rel="noopener noreferrer" className="hover:underline">
                            Watch Video Lecture
                          </a>
                        </div>
                      )}
                      
                      {!isCompleted && (
                        <button
                          onClick={() => completeModuleMutation.mutate(module.id)}
                          disabled={completeModuleMutation.isPending}
                          className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-all text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed shadow-sm hover:shadow-md"
                        >
                          {completeModuleMutation.isPending ? (
                            <span className="flex items-center gap-2">
                              <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                              Processing...
                            </span>
                          ) : (
                            'Mark as Completed'
                          )}
                        </button>
                      )}
                      
                      {isCompleted && (
                        <div className="flex items-center gap-2 text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20 px-4 py-2 rounded-lg">
                          <CheckCircleIcon className="h-5 w-5" />
                          <span className="text-sm font-medium">Module Completed</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Assignments */}
      {assignments && assignments.length > 0 && (
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-slate-900 dark:text-white">
              Your Assignments
            </h2>
            <span className="text-sm text-slate-500 dark:text-slate-400">
              {assignments.filter(a => a.grade !== null).length} of {assignments.length} graded
            </span>
          </div>
          <div className="space-y-3">
            {assignments.map((assignment) => (
              <div 
                key={assignment.id} 
                className={`flex flex-wrap items-center justify-between p-4 border rounded-xl transition-all ${
                  assignment.grade !== null
                    ? 'border-emerald-200 dark:border-emerald-800 bg-emerald-50/30 dark:bg-emerald-900/10'
                    : 'border-slate-200 dark:border-slate-700'
                }`}
              >
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <DocumentTextIcon className={`h-5 w-5 ${
                      assignment.grade !== null ? 'text-emerald-500' : 'text-slate-400'
                    }`} />
                    <h4 className="font-medium text-slate-900 dark:text-white truncate">
                      {assignment.title}
                    </h4>
                  </div>
                  <p className="text-sm text-slate-500 dark:text-slate-400 line-clamp-1">
                    {assignment.description}
                  </p>
                  {assignment.grade !== null && (
                    <div className="mt-2 flex flex-wrap items-center gap-3">
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300">
                        Grade: {assignment.grade}%
                      </span>
                      {assignment.feedback && (
                        <span className="text-sm text-slate-500 dark:text-slate-400">
                          Feedback: {assignment.feedback}
                        </span>
                      )}
                    </div>
                  )}
                </div>
                <div className="flex-shrink-0 ml-4">
                  {assignment.grade !== null ? (
                    <span className="inline-flex items-center px-3 py-1 bg-emerald-100 dark:bg-emerald-900/30 text-emerald-700 dark:text-emerald-300 rounded-lg text-sm font-medium">
                      <CheckCircleIcon className="h-4 w-4 mr-1.5" />
                      Graded
                    </span>
                  ) : (
                    <Link
                      to={`/student/assignments/${assignment.id}/submit`}
                      className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all text-sm font-medium shadow-sm hover:shadow-md"
                    >
                      <DocumentTextIcon className="h-4 w-4 mr-1.5" />
                      Submit
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default CourseProgress;