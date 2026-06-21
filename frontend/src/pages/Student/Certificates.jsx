import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
  TrophyIcon,
  DocumentArrowDownIcon,
  EyeIcon,
  AcademicCapIcon,
  CalendarIcon,
  UserIcon,
  CheckCircleIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { TrophyIcon as TrophySolidIcon } from '@heroicons/react/24/solid';

const Certificates = () => {
  const [generating, setGenerating] = useState(null);

  const { data: certificates, isLoading, refetch } = useQuery({
    queryKey: ['student-certificates'],
    queryFn: async () => {
      const response = await api.get('/student/certificates');
      return response.data;
    },
    retry: 1
  });

  const handleGenerateCertificate = async (courseId) => {
    setGenerating(courseId);
    try {
      const response = await api.post(`/student/courses/${courseId}/certificate`);
      toast.success('Certificate generated successfully!');
      refetch();
      // Open download in new tab
      if (response.data.downloadUrl) {
        window.open(response.data.downloadUrl, '_blank');
      }
    } catch (error) {
      toast.error(error.response?.data?.error || 'Failed to generate certificate');
    } finally {
      setGenerating(null);
    }
  };

  const handleDownload = (url) => {
    window.open(`${import.meta.env.VITE_API_URL}${url}`, '_blank');
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
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <TrophyIcon className="h-7 w-7 text-amber-500" />
            My Certificates
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            View and download your course completion certificates
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <TrophyIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Total Certificates</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {certificates?.length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Courses Completed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {certificates?.filter(c => c.course).length || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-100 dark:bg-emerald-900/20 rounded-lg">
              <CheckCircleIcon className="h-5 w-5 text-emerald-600 dark:text-emerald-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Latest Issued</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {certificates?.length > 0 ? new Date(certificates[0]?.issuedAt).toLocaleDateString() : 'N/A'}
              </p>
            </div>
          </div>
        </div>
      </div>

      {certificates?.length === 0 ? (
        <div className="text-center py-16 bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700">
          <div className="text-7xl mb-4">🎓</div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white mb-2">
            No Certificates Yet
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mx-auto">
            Complete your courses to earn certificates. Each completed course earns you a verified certificate.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {certificates?.map((cert) => (
            <div key={cert.id} className="group bg-white dark:bg-slate-800 rounded-2xl shadow-sm overflow-hidden hover:shadow-xl transition-all duration-300 border border-slate-200 dark:border-slate-700 hover:-translate-y-1">
              {/* Certificate Preview */}
              <div className="relative h-48 bg-gradient-to-br from-blue-600 via-indigo-600 to-purple-600 flex items-center justify-center overflow-hidden">
                <div className="absolute inset-0 bg-black/30"></div>
                <div className="text-center text-white z-10">
                  <TrophySolidIcon className="h-12 w-12 mx-auto mb-2 text-amber-400" />
                  <h3 className="text-lg font-bold line-clamp-1">{cert.course?.title || 'Course Certificate'}</h3>
                  <p className="text-sm text-white/80">Certificate of Completion</p>
                </div>
                <div className="absolute bottom-0 left-0 right-0 h-20 bg-gradient-to-t from-black/50 to-transparent"></div>
                <div className="absolute top-3 right-3 px-2.5 py-1 bg-amber-500 text-white rounded-lg text-xs font-medium shadow-lg">
                  Verified
                </div>
              </div>

              {/* Certificate Details */}
              <div className="p-5">
                <div className="space-y-2 text-sm">
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <UserIcon className="h-4 w-4" />
                    <span>Issued to: <span className="font-medium text-slate-700 dark:text-slate-300">{cert.user?.name || 'You'}</span></span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <CalendarIcon className="h-4 w-4" />
                    <span>Issued: {new Date(cert.issuedAt).toLocaleDateString('en-US', { 
                      year: 'numeric', 
                      month: 'long', 
                      day: 'numeric' 
                    })}</span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                    <AcademicCapIcon className="h-4 w-4" />
                    <span>Course: <span className="font-medium text-slate-700 dark:text-slate-300">{cert.course?.title}</span></span>
                  </div>
                  {cert.course?.instructor && (
                    <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400">
                      <span>👨‍🏫 Instructor: {cert.course.instructor}</span>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="mt-4 flex gap-2">
                  <button
                    onClick={() => handleDownload(cert.fileUrl)}
                    className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center justify-center gap-2 text-sm font-medium shadow-sm hover:shadow-md"
                  >
                    <DocumentArrowDownIcon className="h-4 w-4" />
                    Download
                  </button>
                  <button
                    onClick={() => window.open(`${import.meta.env.VITE_API_URL}${cert.fileUrl}`, '_blank')}
                    className="px-4 py-2.5 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-200 dark:hover:bg-slate-600 transition-all flex items-center justify-center gap-2 text-sm font-medium"
                  >
                    <EyeIcon className="h-4 w-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Motivational Section for Completed Courses Without Certificates */}
      {certificates?.length === 0 && (
        <div className="bg-gradient-to-r from-amber-50 to-blue-50 dark:from-amber-900/10 dark:to-blue-900/10 rounded-xl p-6 border border-amber-200 dark:border-amber-800/30">
          <div className="flex items-center gap-4">
            <SparklesIcon className="h-8 w-8 text-amber-500" />
            <div>
              <h3 className="font-semibold text-slate-900 dark:text-white">Start Earning Certificates</h3>
              <p className="text-sm text-slate-600 dark:text-slate-400">
                Complete courses to earn verified certificates that showcase your skills.
              </p>
            </div>
            <Link
              to="/student/courses"
              className="ml-auto px-4 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-all text-sm font-medium"
            >
              View Courses
            </Link>
          </div>
        </div>
      )}
    </div>
  );
};

export default Certificates;