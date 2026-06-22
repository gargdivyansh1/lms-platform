// frontend/src/pages/Profile.jsx
import React, { useState, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../services/api';
import toast from 'react-hot-toast';
import {
  UserIcon,
  EnvelopeIcon,
  AcademicCapIcon,
  CameraIcon,
  XMarkIcon,
  CheckCircleIcon,
  PencilIcon,
  ShieldCheckIcon,
  CalendarIcon,
  ArrowPathIcon,
  UserGroupIcon,
  SparklesIcon
} from '@heroicons/react/24/outline';
import { ShieldCheckIcon as ShieldSolidIcon } from '@heroicons/react/24/solid';

const Profile = () => {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const fileInputRef = useRef(null);
  const [isEditing, setIsEditing] = useState(false);
  const [avatarFile, setAvatarFile] = useState(null);
  const [avatarPreview, setAvatarPreview] = useState(null);
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    bio: user?.bio || '',
  });

  // Update profile mutation
  const updateProfile = useMutation({
    mutationFn: async (data) => {
      const response = await api.put('/users/profile', data);
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Profile updated successfully');
      setIsEditing(false);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update profile');
    },
  });

  // Update avatar mutation
  const updateAvatar = useMutation({
    mutationFn: async (formData) => {
      const response = await api.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries(['user']);
      toast.success('Avatar updated successfully');
      setAvatarFile(null);
      setAvatarPreview(null);
    },
    onError: (error) => {
      toast.error(error.response?.data?.error || 'Failed to update avatar');
      setAvatarFile(null);
      setAvatarPreview(null);
    },
  });

  // Get user stats
  const { data: userStats, isLoading: statsLoading } = useQuery({
    queryKey: ['user-stats'],
    queryFn: async () => {
      const response = await api.get('/users/statistics');
      return response.data;
    },
    enabled: !!user,
    retry: 1,
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    updateProfile.mutate(formData);
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size exceeds 5MB limit. Please choose a smaller image.');
        e.target.value = '';
        return;
      }

      // Validate file type
      const validTypes = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
      if (!validTypes.includes(file.type)) {
        toast.error('Please upload a valid image file (JPEG, PNG, GIF, or WEBP)');
        e.target.value = '';
        return;
      }

      // Create preview
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result);
      };
      reader.readAsDataURL(file);

      setAvatarFile(file);

      // Upload immediately
      const formData = new FormData();
      formData.append('avatar', file);
      updateAvatar.mutate(formData);
    }
  };

  const removeAvatar = () => {
    setAvatarFile(null);
    setAvatarPreview(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const getRoleBadge = () => {
    const roleColors = {
      ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      INSTRUCTOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      STUDENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    const roleIcons = {
      ADMIN: <ShieldCheckIcon className="h-4 w-4" />,
      INSTRUCTOR: <UserGroupIcon className="h-4 w-4" />,
      STUDENT: <AcademicCapIcon className="h-4 w-4" />
    };
    return (
      <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-sm font-medium ${roleColors[user?.role] || roleColors.STUDENT}`}>
        {roleIcons[user?.role] || roleIcons.STUDENT}
        {user?.role?.toLowerCase() || 'student'}
      </span>
    );
  };

  const getAvatarUrl = () => {
    if (avatarPreview) return avatarPreview;
    if (user?.avatar) {
      // Handle both /uploads/avatars/ and /api/uploads/avatars/ formats
      const avatarPath = user.avatar.startsWith('/api') ? user.avatar : `/api${user.avatar}`;
      return `${import.meta.env.VITE_API_URL}${avatarPath}`;
    }
    return null;
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white flex items-center gap-2">
            <UserIcon className="h-7 w-7 text-blue-600" />
            Profile
          </h1>
          <p className="text-slate-500 dark:text-slate-400">
            Manage your account settings and preferences
          </p>
        </div>
        <button
          onClick={() => {
            setIsEditing(true);
            setFormData({
              name: user?.name || '',
              email: user?.email || '',
              bio: user?.bio || '',
            });
          }}
          className="px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all flex items-center gap-2 shadow-sm hover:shadow-md"
        >
          <PencilIcon className="h-5 w-5" />
          Edit Profile
        </button>
      </div>

      {/* Profile Card */}
      <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-sm border border-slate-200 dark:border-slate-700 overflow-hidden">
        {/* Cover Image */}
        <div className="h-32 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>

        {/* Profile Info */}
        <div className="relative px-6 pb-6">
          {/* Avatar */}
          <div className="relative -mt-16 mb-4">
            <div className="w-32 h-32 rounded-full bg-white dark:bg-slate-800 p-1 shadow-lg">
              <div className="w-full h-full rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white text-4xl font-bold overflow-hidden">
                {getAvatarUrl() ? (
                  <img
                    src={getAvatarUrl()}
                    alt={user?.name}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.style.display = 'none';
                      e.target.parentElement.textContent = getUserInitials();
                    }}
                  />
                ) : (
                  getUserInitials()
                )}
              </div>
            </div>

            {/* Upload Avatar Button */}
            <label className="absolute bottom-2 right-2 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-lg hover:scale-110">
              <CameraIcon className="h-5 w-5 text-white" />
              <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                onChange={handleAvatarChange}
                accept="image/*"
                disabled={updateAvatar.isPending}
              />
            </label>

            {updateAvatar.isPending && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-full">
                <div className="animate-spin rounded-full h-10 w-10 border-4 border-white border-t-transparent"></div>
              </div>
            )}
          </div>

          {/* User Details */}
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <h2 className="text-2xl font-bold text-slate-900 dark:text-white">
                {user?.name}
              </h2>
              <div className="flex flex-wrap items-center gap-3 mt-1">
                <span className="flex items-center gap-1.5 text-sm text-slate-500 dark:text-slate-400">
                  <EnvelopeIcon className="h-4 w-4" />
                  {user?.email}
                </span>
                <span className="w-1 h-1 bg-slate-300 rounded-full"></span>
                <span>{getRoleBadge()}</span>
              </div>
              {user?.bio && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300 max-w-md">
                  {user.bio}
                </p>
              )}
            </div>
            <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
              <CalendarIcon className="h-4 w-4" />
              <span>Joined {new Date(user?.createdAt).toLocaleDateString()}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Cards
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-100 dark:bg-blue-900/20 rounded-lg">
              <AcademicCapIcon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Courses Enrolled</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statsLoading ? '...' : userStats?.totalCourses || 0}
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
              <p className="text-sm text-slate-500 dark:text-slate-400">Completed</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statsLoading ? '...' : userStats?.completedCourses || 0}
              </p>
            </div>
          </div>
        </div>
        <div className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-4 border border-slate-200 dark:border-slate-700">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-amber-100 dark:bg-amber-900/20 rounded-lg">
              <SparklesIcon className="h-5 w-5 text-amber-600 dark:text-amber-400" />
            </div>
            <div>
              <p className="text-sm text-slate-500 dark:text-slate-400">Certificates</p>
              <p className="text-xl font-bold text-slate-900 dark:text-white">
                {statsLoading ? '...' : userStats?.certificates || 0}
              </p>
            </div>
          </div>
        </div>
      </div> */}

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-slate-800 rounded-2xl shadow-2xl max-w-md w-full p-6 border border-slate-200 dark:border-slate-700">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-slate-900 dark:text-white">
                Edit Profile
              </h2>
              <button
                onClick={() => setIsEditing(false)}
                className="p-1.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <XMarkIcon className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                  Bio
                </label>
                <textarea
                  value={formData.bio}
                  onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                  rows={3}
                  className="w-full px-4 py-2.5 border border-slate-300 dark:border-slate-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white transition-colors"
                  placeholder="Tell us about yourself..."
                />
              </div>

              <div className="flex gap-3 pt-2 border-t border-slate-200 dark:border-slate-700">
                <button
                  type="submit"
                  disabled={updateProfile.isPending}
                  className="flex-1 px-4 py-2.5 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all disabled:opacity-50 shadow-sm hover:shadow-md flex items-center justify-center gap-2"
                >
                  {updateProfile.isPending ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <CheckCircleIcon className="h-5 w-5" />
                      Save Changes
                    </>
                  )}
                </button>
                <button
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-4 py-2.5 border border-slate-300 dark:border-slate-600 text-slate-700 dark:text-slate-300 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-700 transition-all"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Profile;