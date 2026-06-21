// frontend/src/pages/Student/Settings.jsx
import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { api } from '../../services/api';
import toast from 'react-hot-toast';
import {
    UserIcon,
    EnvelopeIcon,
    BellIcon,
    ShieldCheckIcon,
    GlobeAltIcon,
    CameraIcon,
    XMarkIcon,
    CheckCircleIcon
} from '@heroicons/react/24/outline';

const Settings = () => {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [avatarFile, setAvatarFile] = useState(null);
    const [avatarPreview, setAvatarPreview] = useState(null);
    const [isUploading, setIsUploading] = useState(false);
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        bio: user?.bio || '',
        notifications: true,
        language: 'en',
        theme: 'system'
    });

    const updateProfileMutation = useMutation({
        mutationFn: async (data) => {
            const response = await api.put('/student/profile', data);
            return response.data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries(['user']);
            toast.success('Profile updated successfully');
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update profile');
        }
    });

    const updateAvatarMutation = useMutation({
        mutationFn: async (formData) => {
            const response = await api.post('/student/avatar', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data',
                },
            });
            return response.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries(['user']);
            toast.success('Avatar updated successfully');
            setAvatarFile(null);
            setAvatarPreview(null);
            // Update user context with new avatar
            if (data.user) {
                queryClient.setQueryData(['user'], data.user);
            }
        },
        onError: (error) => {
            toast.error(error.response?.data?.error || 'Failed to update avatar');
            setAvatarFile(null);
            setAvatarPreview(null);
        }
    });

    const handleSubmit = (e) => {
        e.preventDefault();
        updateProfileMutation.mutate(formData);
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
            updateAvatarMutation.mutate(formData);
        }
    };

    const removeAvatar = () => {
        setAvatarFile(null);
        setAvatarPreview(null);
        // You could also add a remove avatar API call here
    };

    const settingsSections = [
        {
            title: 'Profile Settings',
            icon: UserIcon,
            fields: (
                <>
                    <div className="flex items-center gap-6 mb-4">
                        <div className="relative group">
                            <div className="w-24 h-24 rounded-full bg-blue-600 flex items-center justify-center text-white text-3xl font-bold overflow-hidden shadow-md">
                                {avatarPreview ? (
                                    <img src={avatarPreview} alt="Avatar preview" className="w-full h-full object-cover" />
                                ) : user?.avatar ? (
                                    <img
                                        src={`${import.meta.env.VITE_API_URL}${user.avatar}`}
                                        alt={user.name}
                                        className="w-full h-full object-cover"
                                    />
                                ) : (
                                    user?.name?.[0]?.toUpperCase() || 'S'
                                )}
                            </div>
                            <label className="absolute bottom-0 right-0 p-2 bg-blue-600 rounded-full cursor-pointer hover:bg-blue-700 transition-all shadow-md group-hover:scale-110">
                                <CameraIcon className="h-4 w-4 text-white" />
                                <input
                                    type="file"
                                    className="hidden"
                                    onChange={handleAvatarChange}
                                    accept="image/*"
                                    disabled={updateAvatarMutation.isPending}
                                />
                            </label>
                            {avatarPreview && (
                                <button
                                    onClick={removeAvatar}
                                    className="absolute top-0 right-0 p-1 bg-red-500 rounded-full hover:bg-red-600 transition-all shadow-md"
                                >
                                    <XMarkIcon className="h-3 w-3 text-white" />
                                </button>
                            )}
                            {updateAvatarMutation.isPending && (
                                <div className="absolute inset-0 bg-black/50 rounded-full flex items-center justify-center">
                                    <div className="animate-spin rounded-full h-8 w-8 border-4 border-white border-t-transparent"></div>
                                </div>
                            )}
                        </div>
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">Profile Picture</p>
                            <p className="text-xs text-slate-500 dark:text-slate-400">
                                {updateAvatarMutation.isPending ? 'Uploading...' : 'Click the camera icon to upload'}
                            </p>
                            <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">
                                JPEG, PNG, GIF, WEBP • Max 5MB
                            </p>
                            {updateAvatarMutation.isSuccess && (
                                <p className="text-xs text-emerald-600 dark:text-emerald-400 mt-1 flex items-center gap-1">
                                    <CheckCircleIcon className="h-3 w-3" />
                                    Uploaded successfully
                                </p>
                            )}
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Full Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
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
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            placeholder="Tell us about yourself..."
                        />
                    </div>
                </>
            )
        },
        {
            title: 'Preferences',
            icon: GlobeAltIcon,
            fields: (
                <>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Language
                        </label>
                        <select
                            value={formData.language}
                            onChange={(e) => setFormData({ ...formData, language: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="en">English</option>
                            <option value="es">Spanish</option>
                            <option value="fr">French</option>
                            <option value="de">German</option>
                            <option value="hi">Hindi</option>
                        </select>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Theme
                        </label>
                        <select
                            value={formData.theme}
                            onChange={(e) => setFormData({ ...formData, theme: e.target.value })}
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                        >
                            <option value="system">System Default</option>
                            <option value="light">Light</option>
                            <option value="dark">Dark</option>
                        </select>
                    </div>
                </>
            )
        },
        {
            title: 'Notifications',
            icon: BellIcon,
            fields: (
                <div className="space-y-4">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Email Notifications
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Receive course updates and assignment reminders
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                checked={formData.notifications}
                                onChange={(e) => setFormData({ ...formData, notifications: e.target.checked })}
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm font-medium text-slate-700 dark:text-slate-300">
                                Assignment Reminders
                            </p>
                            <p className="text-sm text-slate-500 dark:text-slate-400">
                                Get reminded about upcoming deadlines
                            </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                            <input
                                type="checkbox"
                                defaultChecked
                                className="sr-only peer"
                            />
                            <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-slate-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-blue-600"></div>
                        </label>
                    </div>
                </div>
            )
        },
        {
            title: 'Security',
            icon: ShieldCheckIcon,
            fields: (
                <div className="space-y-4">
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Current Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            placeholder="Enter current password"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            New Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            placeholder="Enter new password (min 8 characters)"
                        />
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 mb-1">
                            Confirm New Password
                        </label>
                        <input
                            type="password"
                            className="w-full px-4 py-2 border border-slate-300 dark:border-slate-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent dark:bg-slate-700 dark:text-white"
                            placeholder="Confirm new password"
                        />
                    </div>
                    <button
                        type="button"
                        className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all"
                    >
                        Change Password
                    </button>
                </div>
            )
        }
    ];

    return (
        <div className="space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
                <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Settings</h1>
                <button
                    onClick={handleSubmit}
                    disabled={updateProfileMutation.isPending}
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all disabled:opacity-50 flex items-center gap-2"
                >
                    {updateProfileMutation.isPending ? (
                        <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                            Saving...
                        </>
                    ) : (
                        'Save Changes'
                    )}
                </button>
            </div>

            <div className="space-y-6">
                {settingsSections.map((section, index) => (
                    <div key={index} className="bg-white dark:bg-slate-800 rounded-xl shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-2 bg-blue-50 dark:bg-blue-900/20 rounded-lg">
                                <section.icon className="h-5 w-5 text-blue-600 dark:text-blue-400" />
                            </div>
                            <h2 className="text-lg font-semibold text-slate-900 dark:text-white">
                                {section.title}
                            </h2>
                        </div>
                        <div className="space-y-4">
                            {section.fields}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default Settings;