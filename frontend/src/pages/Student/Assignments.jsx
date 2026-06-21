import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import { Link } from 'react-router-dom';
import {
  DocumentTextIcon,
  CheckCircleIcon,
  ClockIcon,
  XCircleIcon,
  ArrowUpTrayIcon,
  EyeIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  MagnifyingGlassIcon,
  BookOpenIcon,
  BookmarkIcon
} from '@heroicons/react/24/outline';

const Assignments = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState('all');
  const [expandedAssignment, setExpandedAssignment] = useState(null);

  const { data: assignments, isLoading } = useQuery({
    queryKey: ['student-assignments'],
    queryFn: async () => {
      const response = await api.get('/student/assignments');
      return response.data;
    },
    retry: 1
  });
  

  const filteredAssignments = assignments?.filter(assignment => {
    const matchesSearch = assignment.title.toLowerCase().includes(search.toLowerCase()) ||
                          assignment.course?.title.toLowerCase().includes(search.toLowerCase());
    
    if (filter === 'all') return matchesSearch;
    if (filter === 'graded') return matchesSearch && assignment.grade !== null;
    if (filter === 'pending') return matchesSearch && assignment.grade === null && assignment.submittedAt;
    if (filter === 'not-submitted') return matchesSearch && !assignment.submittedAt;
    return matchesSearch;
  });

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
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Assignments</h1>
          <p className="text-slate-500 dark:text-slate-400">Track and submit your assignments</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-slate-500 dark:text-slate-400">
            {assignments?.length || 0} total
          </span>
        </div>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap items-center gap-4">
        <div className="flex-1 min-w-[200px] relative">
          <input
            type="text"
            placeholder="Search assignments..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 pl-11 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:text-white"
          />
          <MagnifyingGlassIcon className="h-5 w-5 text-slate-400 absolute left-3.5 top-3" />
        </div>
        <div className="flex flex-wrap gap-2">
          {['all', 'pending', 'graded', 'not-submitted'].map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                filter === f
                  ? 'bg-blue-600 text-white shadow-sm'
                  : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700'
              }`}
            >
              {f === 'all' ? 'All' : f === 'pending' ? 'Pending Review' : f === 'graded' ? 'Graded' : 'Not Submitted'}
            </button>
          ))}
        </div>
      </div>

      {filteredAssignments?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-xl shadow-sm">
          <div className="flex justify-center text-6xl mb-4"><BookmarkIcon className="h-10 w-10" /></div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Assignments Found
          </h2>
          <p className="text-slate-500 dark:text-slate-400">
            {search ? 'Try adjusting your search' : 'Assignments will appear here when you enroll in courses'}
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredAssignments?.map((assignment) => (
            <div key={assignment.id} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm overflow-hidden hover:shadow-md transition-shadow">
              <div 
                className="p-5 cursor-pointer hover:bg-slate-50 dark:hover:bg-slate-700/50 transition-colors"
                onClick={() => toggleExpand(assignment.id)}
              >
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-3">
                      <DocumentTextIcon className="h-5 w-5 text-blue-600 flex-shrink-0" />
                      <h3 className="text-lg font-semibold text-slate-900 dark:text-white truncate">
                        {assignment.title}
                      </h3>
                    </div>
                    <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
                      {assignment.course?.title || 'Unknown Course'}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 flex-shrink-0">
                    {getStatusBadge(assignment)}
                    {assignment.grade !== null && (
                      <span className="text-sm font-bold text-emerald-600 dark:text-emerald-400">
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

              {expandedAssignment === assignment.id && (
                <div className="p-5 border-t border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-700/50">
                  <div className="space-y-4">
                    {assignment.description && (
                      <div>
                        <h4 className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</h4>
                        <p className="text-sm text-slate-600 dark:text-slate-400 mt-1">{assignment.description}</p>
                      </div>
                    )}
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-sm">
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">Submitted:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                          {assignment.submittedAt ? new Date(assignment.submittedAt).toLocaleString() : 'Not submitted'}
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 dark:text-slate-400">File Size:</span>
                        <span className="ml-2 text-slate-700 dark:text-slate-300">
                          {assignment.fileSize ? `${(assignment.fileSize / (1024 * 1024)).toFixed(2)} MB` : 'N/A'}
                        </span>
                      </div>
                    </div>

                    {assignment.grade !== null && assignment.feedback && (
                      <div className="p-3 bg-emerald-50 dark:bg-emerald-900/20 rounded-lg">
                        <h4 className="text-sm font-medium text-emerald-700 dark:text-emerald-300">Feedback</h4>
                        <p className="text-sm text-emerald-600 dark:text-emerald-400 mt-1">{assignment.feedback}</p>
                      </div>
                    )}

                    <div className="flex flex-wrap gap-3">
                      {assignment.fileUrl && (
                        <a
                          href={`${import.meta.env.VITE_API_URL}${assignment.fileUrl}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center px-3 py-1.5 bg-slate-100 dark:bg-slate-600 text-slate-700 dark:text-slate-300 rounded-lg hover:bg-slate-200 dark:hover:bg-slate-500 text-sm"
                        >
                          <EyeIcon className="h-4 w-4 mr-1" />
                          View Submission
                        </a>
                      )}
                      {!assignment.submittedAt && (
                        <Link
                          to={`/student/assignments/${assignment.id}/submit`}
                          className="inline-flex items-center px-3 py-1.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                        >
                          <ArrowUpTrayIcon className="h-4 w-4 mr-1" />
                          Submit Assignment
                        </Link>
                      )}
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

export default Assignments;