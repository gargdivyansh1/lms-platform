import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  ArrowLeftIcon,
  DocumentArrowUpIcon,
  XMarkIcon,
  CheckCircleIcon,
  DocumentTextIcon,
  ClockIcon,
  ExclamationTriangleIcon
} from '@heroicons/react/24/outline';

const AssignmentSubmit = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const [file, setFile] = useState(null);
  const [comment, setComment] = useState('');
  const [dragOver, setDragOver] = useState(false);

  const { data: assignment, isLoading } = useQuery({
    queryKey: ['assignment-detail', id],
    queryFn: async () => {
      const response = await api.get(`/assignments/${id}`);
      return response.data;
    },
    enabled: !!id,
    retry: 1
  });

  const submitMutation = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post(`/assignments/${id}/submit`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['student-assignments']);
      queryClient.invalidateQueries(['assignment-detail', id]);
      toast.success('Assignment submitted successfully!');
      navigate('/student/assignments');
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to submit assignment');
    }
  });

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.size > 200 * 1024 * 1024) {
        toast.error('File size exceeds 200MB limit');
        return;
      }
      setFile(selectedFile);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFile = e.dataTransfer.files[0];
    if (droppedFile) {
      if (droppedFile.size > 200 * 1024 * 1024) {
        toast.error('File size exceeds 200MB limit');
        return;
      }
      setFile(droppedFile);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!file) {
      toast.error('Please select a file to upload');
      return;
    }

    const formData = new FormData();
    formData.append('file', file);
    if (comment) {
      formData.append('comment', comment);
    }

    submitMutation.mutate(formData);
  };

  const removeFile = () => {
    setFile(null);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-blue-600 border-t-transparent"></div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <div className="text-6xl mb-4">🔍</div>
        <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
          Assignment not found
        </h2>
        <button
          onClick={() => navigate('/student/assignments')}
          className="mt-4 text-blue-600 hover:underline"
        >
          Back to assignments
        </button>
      </div>
    );
  }

  // Check if already submitted
  if (assignment.submittedAt) {
    return (
      <div className="max-w-2xl mx-auto">
        <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="p-4 bg-emerald-100 dark:bg-emerald-900/20 rounded-full">
              <CheckCircleIcon className="h-16 w-16 text-emerald-500" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Already Submitted
          </h2>
          <p className="text-slate-500 dark:text-slate-400 mb-4">
            You have already submitted this assignment on {new Date(assignment.submittedAt).toLocaleString()}
          </p>
          {assignment.fileUrl && (
            <a
              href={`${import.meta.env.VITE_API_URL}${assignment.fileUrl}`}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm"
            >
              <DocumentTextIcon className="h-4 w-4 mr-2" />
              View Your Submission
            </a>
          )}
          <div className="mt-4">
            <button
              onClick={() => navigate('/student/assignments')}
              className="px-6 py-2 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all"
            >
              Back to Assignments
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto">
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm p-6">
        {/* Assignment Info */}
        <div className="mb-6 pb-6 border-b border-slate-200 dark:border-slate-700">
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white mb-2">
            Submit Assignment
          </h1>
          <p className="text-lg font-semibold text-slate-700 dark:text-slate-300">
            {assignment.course?.title}
          </p>
          <p className="text-sm text-slate-500 dark:text-slate-400">
            {assignment.title}
          </p>
          {assignment.description && (
            <div className="mt-2 p-3 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
              <p className="text-sm text-slate-600 dark:text-slate-400">
                {assignment.description}
              </p>
            </div>
          )}
          <div className="mt-3 flex flex-wrap items-center gap-4 text-sm text-slate-500 dark:text-slate-400">
            <span className="flex items-center gap-1.5">
              <ClockIcon className="h-4 w-4" />
              Status: Not Submitted
            </span>
            {assignment.dueDate && (
              <span className="flex items-center gap-1.5">
                <ExclamationTriangleIcon className="h-4 w-4 text-amber-500" />
                Due: {new Date(assignment.dueDate).toLocaleString()}
              </span>
            )}
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* File Upload Area */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Upload File *
            </label>
            {!file ? (
              <div
                className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
                  dragOver
                    ? 'border-blue-500 bg-blue-50 dark:bg-blue-900/20'
                    : 'border-slate-300 dark:border-slate-600 hover:border-slate-400 dark:hover:border-slate-500'
                }`}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <div className="flex justify-center mb-4">
                  <div className="p-4 bg-blue-50 dark:bg-blue-900/20 rounded-full">
                    <DocumentArrowUpIcon className="h-12 w-12 text-blue-500" />
                  </div>
                </div>
                <p className="text-slate-600 dark:text-slate-300 mb-2 font-medium">
                  Drag and drop your file here, or click to browse
                </p>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Supported formats: PDF, DOC, DOCX, ZIP (Max 200MB)
                </p>
                <input
                  type="file"
                  className="hidden"
                  id="fileInput"
                  onChange={handleFileChange}
                  accept=".pdf,.doc,.docx,.zip"
                />
                <button
                  type="button"
                  onClick={() => document.getElementById('fileInput').click()}
                  className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all shadow-sm hover:shadow-md"
                >
                  Browse Files
                </button>
              </div>
            ) : (
              <div className="flex items-center justify-between p-4 bg-blue-50 dark:bg-blue-900/20 rounded-xl border border-blue-200 dark:border-blue-800">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 dark:bg-blue-900/40 rounded-lg">
                    <DocumentTextIcon className="h-6 w-6 text-blue-500" />
                  </div>
                  <div>
                    <p className="font-medium text-slate-900 dark:text-white">{file.name}</p>
                    <p className="text-sm text-slate-500 dark:text-slate-400">
                      {(file.size / (1024 * 1024)).toFixed(2)} MB
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={removeFile}
                  className="p-2 text-slate-400 hover:text-red-500 transition-colors rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20"
                >
                  <XMarkIcon className="h-5 w-5" />
                </button>
              </div>
            )}
          </div>

          {/* Comment */}
          <div>
            <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-2">
              Comment (Optional)
            </label>
            <textarea
              value={comment}
              onChange={(e) => setComment(e.target.value)}
              rows={4}
              className="w-full px-4 py-3 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
              placeholder="Add any additional notes for your instructor..."
            />
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-slate-200 dark:border-slate-700">
            <button
              type="submit"
              disabled={!file || submitMutation.isPending}
              className="flex-1 px-6 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-sm hover:shadow-md font-medium"
            >
              {submitMutation.isPending ? (
                <>
                  <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                  Uploading...
                </>
              ) : (
                <>
                  <DocumentArrowUpIcon className="h-5 w-5" />
                  Submit Assignment
                </>
              )}
            </button>
            <button
              type="button"
              onClick={() => navigate('/student/assignments')}
              className="px-6 py-3 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all font-medium"
            >
              Cancel
            </button>
          </div>
        </form>

        {/* Submission Guidelines */}
        <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-700/50 rounded-xl">
          <h4 className="text-sm font-semibold text-slate-700 dark:text-slate-300 mb-2">
            Submission Guidelines
          </h4>
          <ul className="text-sm text-slate-500 dark:text-slate-400 space-y-1">
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Maximum file size: 200MB
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Supported formats: PDF, DOC, DOCX, ZIP
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              Make sure your file is properly named
            </li>
            <li className="flex items-start gap-2">
              <span className="text-blue-500">•</span>
              You can only submit once per assignment
            </li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default AssignmentSubmit;