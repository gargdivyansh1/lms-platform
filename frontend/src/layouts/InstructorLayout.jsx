// frontend/src/layouts/InstructorLayout.jsx
import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation, Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  HomeIcon,
  BookOpenIcon,
  UserGroupIcon,
  DocumentTextIcon,
  ChartBarIcon,
  CogIcon,
  UserCircleIcon,
  ArrowLeftOnRectangleIcon,
  Bars3Icon,
  XMarkIcon,
  AcademicCapIcon,
  PlusIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  UserIcon
} from '@heroicons/react/24/outline';

const InstructorLayout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [isCollapsed, setIsCollapsed] = useState(false);

  // Close sidebar on route change (mobile)
  useEffect(() => {
    setSidebarOpen(false);
  }, [location.pathname]);

  // Redirect if not instructor or admin
  if (!user || (user.role !== 'INSTRUCTOR' && user.role !== 'ADMIN')) {
    return <Navigate to="/" replace />;
  }

  const navigation = [
    { name: 'Dashboard', href: '/instructor', icon: HomeIcon },
    { name: 'My Courses', href: '/instructor/courses', icon: BookOpenIcon },
    { name: 'Students', href: '/instructor/students', icon: UserGroupIcon },
    { name: 'Assignments', href: '/instructor/assignments', icon: DocumentTextIcon },
    { name: 'Analytics', href: '/instructor/analytics', icon: ChartBarIcon },
    { name: 'Settings', href: '/instructor/settings', icon: CogIcon },
  ];

  const isActive = (path) => {
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  const toggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-900">
      {/* Mobile sidebar backdrop */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm lg:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside
        className={`fixed inset-y-0 left-0 z-50 bg-white dark:bg-slate-800 shadow-2xl transform transition-all duration-300 ease-in-out ${isCollapsed ? 'w-20' : 'w-64'
          } ${sidebarOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}`}
      >
        {/* Header */}
        <div className={`flex items-center h-16 px-4 border-b border-slate-200 dark:border-slate-700 ${isCollapsed ? 'justify-center' : 'justify-between'
          }`}>
          {!isCollapsed ? (
            <>
              <Link to="/" className="flex items-center space-x-2">
                <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2 rounded-xl shadow-md">
                  <UserIcon className="h-6 w-6 text-white" />
                </div>
                <div>
                  <span className="text-lg font-bold text-slate-900 dark:text-white">Instructor</span>
                  <span className="block text-[10px] text-slate-500 dark:text-slate-400 font-medium tracking-wider uppercase">
                    Portal
                  </span>
                </div>
              </Link>
              <button
                onClick={() => setSidebarOpen(false)}
                className="lg:hidden text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200"
              >
                <XMarkIcon className="h-6 w-6" />
              </button>
            </>
          ) : (
            <Link to="/" className="flex items-center space-x-2">
              <div className="bg-gradient-to-br from-blue-500 to-blue-600 p-2.5 rounded-xl shadow-md">
                <UserIcon className="h-7 w-7 text-white" />
              </div>
            </Link>
          )}
        </div>

        {/* Navigation */}
        <nav className="mt-6 px-3 space-y-1">
          {navigation.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.name}
                to={item.href}
                className={`flex items-center px-3 py-3 rounded-xl transition-all duration-200 group ${active
                    ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 shadow-sm'
                    : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700'
                  } ${isCollapsed ? 'justify-center' : ''}`}
                onClick={() => setSidebarOpen(false)}
                title={isCollapsed ? item.name : ''}
              >
                <item.icon className={`h-5 w-5 flex-shrink-0 ${active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                  }`} />
                {!isCollapsed && (
                  <span className="ml-3 font-medium text-sm">{item.name}</span>
                )}
                {isCollapsed && (
                  <span className="absolute left-16 ml-6 px-2 py-1 bg-slate-800 dark:bg-slate-700 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none">
                    {item.name}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* User info at bottom */}
        <div className={`absolute bottom-0 left-0 right-0 p-4 border-t border-slate-200 dark:border-slate-700 ${isCollapsed ? 'flex justify-center' : ''
          }`}>
          {!isCollapsed ? (
            <div className="flex items-center space-x-3">
              <div className="relative">
                <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                  {user?.name?.[0]?.toUpperCase() || 'I'}
                </div>
                <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-slate-900 dark:text-white truncate">
                  {user?.name || 'Instructor'}
                </p>
                <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                  {user?.email || 'instructor@lms.com'}
                </p>
              </div>
              <button
                onClick={logout}
                className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-5 w-5" />
              </button>
            </div>
          ) : (
            <div className="relative">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                {user?.name?.[0]?.toUpperCase() || 'I'}
              </div>
              <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-800"></div>
              <button
                onClick={logout}
                className="absolute -top-1 -right-1 p-1.5 bg-red-500 text-white rounded-full hover:bg-red-600 transition-all shadow-sm"
                title="Logout"
              >
                <ArrowLeftOnRectangleIcon className="h-3 w-3" />
              </button>
            </div>
          )}
        </div>
      </aside>

      {/* Main content */}
      <div className={`transition-all duration-300 ${isCollapsed ? 'lg:pl-20' : 'lg:pl-64'}`}>
        {/* Top header */}
        <header className="bg-white/80 dark:bg-slate-800/80 backdrop-blur-sm shadow-sm border-b border-slate-200 dark:border-slate-700 sticky top-0 z-30">
          <div className="flex items-center justify-between px-4 py-3">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen(true)}
                className="lg:hidden p-2 rounded-xl text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 transition-all"
              >
                <Bars3Icon className="h-6 w-6" />
              </button>
              <button
                onClick={toggleCollapse}
                className="hidden lg:flex p-2 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                {isCollapsed ? (
                  <ChevronRightIcon className="h-5 w-5" />
                ) : (
                  <ChevronLeftIcon className="h-5 w-5" />
                )}
              </button>
              <div>
                <h1 className="text-xl font-bold text-slate-900 dark:text-white">
                  {navigation.find(item => isActive(item.href))?.name || 'Dashboard'}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400 hidden sm:block">
                  {user?.name ? `Welcome back, ${user.name.split(' ')[0]}` : 'Welcome back'}
                </p>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Link
                to="/profile"
                className="p-2.5 rounded-xl text-slate-500 hover:text-blue-600 hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all"
              >
                <UserCircleIcon className="h-6 w-6" />
              </Link>
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="p-4 md:p-6">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default InstructorLayout;