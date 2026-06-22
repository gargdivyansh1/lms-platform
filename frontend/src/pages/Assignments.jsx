import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { api } from '../services/api';
import { 
  DocumentIcon, 
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const Assignments = () => {
  const { data: assignments, isLoading } = useQuery({
    queryKey: ['my-assignments'],
    queryFn: async () => {
      const response = await api.get('/assignments/my-assignments');
      return response.data;
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  if (!assignments || assignments.length === 0) {
    return (
      <div className="text-center py-12">
        <div className="flex justify-center text-6xl mb-4"><BookmarkIcon className='h-10 w-10'/></div>
        <h2 className="text-2xl font-semibold text-gray-900 dark:text-white mb-2">
          No Assignments Yet
        </h2>
        <p className="text-gray-600 dark:text-gray-400">
          Submit assignments from your enrolled courses.
        </p>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">
        My Assignments
      </h1>
      <div className="space-y-4">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="card p-6 hover:shadow-xl transition-shadow">
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div className="flex-1">
                <div className="flex items-center gap-2 mb-2">
                  <DocumentIcon className="h-5 w-5 text-blue-600" />
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {assignment.title}
                  </h3>
                </div>
                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                  Course: {assignment.course.title}
                </p>
                {assignment.description && (
                  <p className="text-gray-600 dark:text-gray-400 text-sm mb-2">
                    {assignment.description}
                  </p>
                )}
                <div className="flex flex-wrap gap-4 text-sm text-gray-500 dark:text-gray-400">
                  <span>Submitted: {new Date(assignment.submittedAt).toLocaleDateString()}</span>
                  <span>•</span>
                  <span>File size: {(assignment.fileSize / (1024 * 1024)).toFixed(2)} MB</span>
                </div>
              </div>
              <div className="flex flex-col items-end gap-2">
                {assignment.grade !== null ? (
                  <div className="text-center">
                    <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-green-100 dark:bg-green-900 text-green-700 dark:text-green-300">
                      <CheckCircleIcon className="h-4 w-4 mr-1" />
                      Graded
                    </span>
                    <div className="mt-1 text-2xl font-bold text-green-600 dark:text-green-400">
                      {assignment.grade}%
                    </div>
                  </div>
                ) : (
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-yellow-100 dark:bg-yellow-900 text-yellow-700 dark:text-yellow-300">
                    <ClockIcon className="h-4 w-4 mr-1" />
                    Pending Review
                  </span>
                )}
                {assignment.feedback && (
                  <div className="mt-2 text-sm text-gray-600 dark:text-gray-400 max-w-xs">
                    <p className="font-medium">Feedback:</p>
                    <p>{assignment.feedback}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;