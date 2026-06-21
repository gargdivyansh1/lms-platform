// frontend/src/components/Navbar.jsx
import React, { useState, Fragment, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { Menu, Transition } from '@headlessui/react';
import {
  HomeIcon,
  BookOpenIcon,
  AcademicCapIcon,
  ClipboardDocumentListIcon,
  Bars3Icon,
  XMarkIcon,
  MoonIcon,
  SunIcon,
  UserCircleIcon,
  ArrowRightOnRectangleIcon,
  CogIcon,
  HeartIcon,
  ChartBarIcon,
  UserGroupIcon,
  ShieldCheckIcon,
  MagnifyingGlassIcon,
  ChevronDownIcon,
  UserIcon,
  SparklesIcon,
  TrophyIcon,
  BellIcon
} from '@heroicons/react/24/outline';

const Navbar = () => {
  const { user, logout, isAuthenticated, isInstructor, isAdmin } = useAuth();
  const [isDark, setIsDark] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('theme') === 'dark' ||
        (!localStorage.getItem('theme') && window.matchMedia('(prefers-color-scheme: dark)').matches);
    }
    return false;
  });
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);

  const toggleTheme = () => {
    const newTheme = !isDark;
    setIsDark(newTheme);
    document.documentElement.classList.toggle('dark');
    localStorage.setItem('theme', newTheme ? 'dark' : 'light');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const getRoleBadge = () => {
    if (!user) return null;
    const roleColors = {
      ADMIN: 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400',
      INSTRUCTOR: 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400',
      STUDENT: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-400'
    };
    const roleLabels = {
      ADMIN: 'Administrator',
      INSTRUCTOR: 'Instructor',
      STUDENT: 'Student'
    };
    const roleIcons = {
      ADMIN: <ShieldCheckIcon className="h-3 w-3 mr-1" />,
      INSTRUCTOR: <UserGroupIcon className="h-3 w-3 mr-1" />,
      STUDENT: <AcademicCapIcon className="h-3 w-3 mr-1" />
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${roleColors[user.role] || roleColors.STUDENT}`}>
        {roleIcons[user.role]}
        {roleLabels[user.role] || 'Student'}
      </span>
    );
  };

  const getUserInitials = () => {
    if (!user?.name) return 'U';
    return user.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  const isNavActive = (href) => {
    if (href === '/') return location.pathname === '/';
    if (href === '/courses' || href === '/instructor/courses') {
      return location.pathname === '/courses' || location.pathname === '/instructor/courses' || location.pathname.startsWith('/courses/');
    }
    return location.pathname === href || location.pathname.startsWith(href + '/');
  };

  const getDashboardLink = () => {
    if (isAdmin) return '/admin';
    if (isInstructor) return '/instructor';
    if (isAuthenticated) return '/student';
    return null;
  };

  const getDashboardLabel = () => {
    if (isAdmin) return 'Admin Dashboard';
    if (isAuthenticated && !isInstructor) return 'Student Dashboard';
    return null;
  };

  // Navigation items - Unified for all roles
  const getNavItems = () => {
    const items = [];

    // Home - always visible
    items.push({ name: 'Home', href: '/', icon: HomeIcon });

    // Courses - visible to everyone
    if (isInstructor) {
      items.push({ 
        name: 'My Courses', 
        href: '/instructor/courses', 
        icon: BookOpenIcon 
      });
    } else {
      items.push({ name: 'Courses', href: '/courses', icon: BookOpenIcon });
    }

    // Dashboard - visible to all authenticated users
    if (isAuthenticated) {
      const dashboardLink = getDashboardLink();
      const dashboardLabel = getDashboardLabel();
      if (dashboardLink && dashboardLabel) {
        items.push({
          name: dashboardLabel,
          href: dashboardLink,
          icon: isAdmin ? ShieldCheckIcon : isInstructor ? UserGroupIcon : AcademicCapIcon
        });
      }
    }

    // Instructor specific dropdown
    if (isInstructor) {
      items.push({ 
        name: 'Instructor', 
        href: '/instructor', 
        icon: UserGroupIcon,
        subItems: [
          { name: 'Dashboard', href: '/instructor' },
          { name: 'My Courses', href: '/instructor/courses' },
          { name: 'Students', href: '/instructor/students' },
          { name: 'Assignments', href: '/instructor/assignments' },
          { name: 'Analytics', href: '/instructor/analytics' },
        ]
      });
    }

    // Admin specific dropdown
    if (isAdmin) {
      items.push({ 
        name: 'Admin', 
        href: '/admin', 
        icon: ShieldCheckIcon,
        subItems: [
          { name: 'Dashboard', href: '/admin' },
          { name: 'Users', href: '/admin/users' },
          { name: 'Courses', href: '/admin/courses' },
          { name: 'Analytics', href: '/admin/analytics' },
          { name: 'Settings', href: '/admin/settings' },
        ]
      });
    }

    return items;
  };

  const navItems = getNavItems();

  // User menu items based on role
  const getUserMenuItems = () => {
    const items = [];

    // Dashboard
    const dashboardLink = getDashboardLink();
    const dashboardLabel = getDashboardLabel();
    if (dashboardLink && dashboardLabel) {
      items.push({
        label: dashboardLabel,
        href: dashboardLink,
        icon: isAdmin ? ShieldCheckIcon : isInstructor ? UserGroupIcon : AcademicCapIcon
      });
    }

    // Student specific
    if (isAuthenticated && !isInstructor && !isAdmin) {
      items.push({
        label: 'Assignments',
        href: '/assignments',
        icon: ClipboardDocumentListIcon
      });
      items.push({
        label: 'Wishlist',
        href: '/student/wishlist',
        icon: HeartIcon
      });
      items.push({
        label: 'Progress',
        href: '/student/progress',
        icon: ChartBarIcon
      });
    }

    // Instructor specific
    if (isInstructor) {
      items.push({
        label: 'My Students',
        href: '/instructor/students',
        icon: UserGroupIcon
      });
      items.push({
        label: 'Create Course',
        href: '/instructor/courses/create',
        icon: SparklesIcon
      });
    }

    // Admin specific
    if (isAdmin) {
      items.push({
        label: 'User Management',
        href: '/admin/users',
        icon: UserIcon
      });
      items.push({
        label: 'Course Management',
        href: '/admin/courses',
        icon: BookOpenIcon
      });
    }

    // Settings
    if (isAuthenticated) {
      const settingsPath = isAdmin ? '/admin/settings' : isInstructor ? '/instructor/settings' : '/student/settings';
      items.push({
        label: 'Settings',
        href: settingsPath,
        icon: CogIcon
      });
    }

    return items;
  };

  const userMenuItems = getUserMenuItems();

  return (
    <nav className={`sticky top-0 z-50 transition-all duration-300 ${
      scrolled 
        ? 'bg-white/95 dark:bg-slate-900/95 backdrop-blur-md shadow-lg' 
        : 'bg-white dark:bg-slate-900 shadow-sm'
    } border-b border-slate-200 dark:border-slate-800`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link 
            to="/" 
            className="flex items-center space-x-3 flex-shrink-0 group"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
              <AcademicCapIcon className="h-7 w-7 text-white" />
            </div>
            <div className="flex flex-col">
              <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                LearnHub
              </span>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase -mt-0.5">
                Learning Platform
              </span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center flex-1 justify-center px-6">
            <div className="flex items-center space-x-1">
              {navItems.map((item) => {
                const isActive = isNavActive(item.href);
                if (item.subItems) {
                  return (
                    <Menu as="div" key={item.name} className="relative">
                      <Menu.Button
                        className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                          isActive || isNavActive(item.href)
                            ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                            : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                        }`}
                      >
                        <item.icon className={`h-5 w-5 mr-2 ${
                          isActive || isNavActive(item.href) ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                        }`} />
                        {item.name}
                        <ChevronDownIcon className="h-4 w-4 ml-1" />
                      </Menu.Button>
                      <Transition
                        as={Fragment}
                        enter="transition ease-out duration-100"
                        enterFrom="transform opacity-0 scale-95"
                        enterTo="transform opacity-100 scale-100"
                        leave="transition ease-in duration-75"
                        leaveFrom="transform opacity-100 scale-100"
                        leaveTo="transform opacity-0 scale-95"
                      >
                        <Menu.Items className="absolute left-0 mt-2 w-56 origin-top-left bg-white dark:bg-slate-800 rounded-xl shadow-lg py-1 ring-1 ring-black ring-opacity-5 focus:outline-none z-50">
                          {item.subItems.map((subItem) => {
                            const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/');
                            return (
                              <Menu.Item key={subItem.href}>
                                {({ active }) => (
                                  <Link
                                    to={subItem.href}
                                    className={`${
                                      active || isSubActive ? 'bg-slate-100 dark:bg-slate-700' : ''
                                    } block px-4 py-2.5 text-sm text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700 transition-colors`}
                                  >
                                    {subItem.name}
                                  </Link>
                                )}
                              </Menu.Item>
                            );
                          })}
                        </Menu.Items>
                      </Transition>
                    </Menu>
                  );
                }
                return (
                  <Link
                    key={item.name}
                    to={item.href}
                    className={`flex items-center px-4 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400 shadow-sm'
                        : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400'
                    }`}
                  >
                    <item.icon className={`h-5 w-5 mr-2 ${
                      isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400 group-hover:text-blue-500'
                    }`} />
                    {item.name}
                  </Link>
                );
              })}
            </div>
          </div>

          {/* Right side */}
          <div className="flex items-center space-x-2 sm:space-x-3">

            {/* Theme toggle */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle theme"
            >
              {isDark ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
            </button>

            {/* User menu - Desktop */}
            {isAuthenticated ? (
              <Menu as="div" className="relative">
                <Menu.Button className="flex items-center space-x-3 px-3 py-2 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 group">
                  <div className="relative">
                    <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-semibold text-sm shadow-md">
                      {user?.avatar ? (
                        <img 
                          src={`${import.meta.env.VITE_API_URL}${user.avatar}`} 
                          alt={user.name} 
                          className="w-full h-full rounded-full object-cover"
                          onError={(e) => {
                            e.target.style.display = 'none';
                            e.target.parentElement.textContent = getUserInitials();
                          }}
                        />
                      ) : (
                        getUserInitials()
                      )}
                    </div>
                    <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white dark:border-slate-900"></div>
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-slate-900 dark:text-white leading-tight">
                      {user?.name?.split(' ')[0] || 'User'}
                    </p>
                    <div className="flex items-center">
                      {getRoleBadge()}
                    </div>
                  </div>
                  <ChevronDownIcon className="hidden sm:block h-4 w-4 text-slate-400 group-hover:text-slate-600 dark:group-hover:text-slate-300 transition-colors" />
                </Menu.Button>

                <Transition
                  as={Fragment}
                  enter="transition ease-out duration-200"
                  enterFrom="transform opacity-0 scale-95"
                  enterTo="transform opacity-100 scale-100"
                  leave="transition ease-in duration-150"
                  leaveFrom="transform opacity-100 scale-100"
                  leaveTo="transform opacity-0 scale-95"
                >
                  <Menu.Items className="absolute right-0 mt-3 w-72 origin-top-right bg-white dark:bg-slate-800 rounded-2xl shadow-2xl py-2 ring-1 ring-black/5 dark:ring-white/5 focus:outline-none z-50">
                    {/* User Info */}
                    <div className="px-5 py-4 border-b border-slate-100 dark:border-slate-700">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-lg shadow-md flex-shrink-0">
                          {user?.avatar ? (
                            <img 
                              src={`${import.meta.env.VITE_API_URL}${user.avatar}`} 
                              alt={user.name} 
                              className="w-full h-full rounded-full object-cover"
                              onError={(e) => {
                                e.target.style.display = 'none';
                                e.target.parentElement.textContent = getUserInitials();
                              }}
                            />
                          ) : (
                            getUserInitials()
                          )}
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-bold text-slate-900 dark:text-white truncate">
                            {user?.name}
                          </p>
                          <p className="text-xs text-slate-500 dark:text-slate-400 truncate">
                            {user?.email}
                          </p>
                          <div className="mt-1">
                            {getRoleBadge()}
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Menu Items */}
                    <div className="py-2">
                      {userMenuItems.map((item) => (
                        <Menu.Item key={item.href}>
                          {({ active }) => (
                            <Link
                              to={item.href}
                              className={`${
                                active ? 'bg-slate-50 dark:bg-slate-700/50' : ''
                              } flex items-center px-5 py-2.5 text-sm text-slate-700 dark:text-slate-300 transition-colors`}
                            >
                              <item.icon className={`h-5 w-5 mr-3 ${
                                active ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                              }`} />
                              {item.label}
                            </Link>
                          )}
                        </Menu.Item>
                      ))}
                    </div>

                    {/* Logout */}
                    <div className="border-t border-slate-100 dark:border-slate-700 pt-2">
                      <Menu.Item>
                        {({ active }) => (
                          <button
                            onClick={handleLogout}
                            className={`${
                              active ? 'bg-red-50 dark:bg-red-900/20' : ''
                            } flex w-full items-center px-5 py-2.5 text-sm text-red-600 dark:text-red-400 transition-colors`}
                          >
                            <ArrowRightOnRectangleIcon className="h-5 w-5 mr-3 text-red-400" />
                            Logout
                          </button>
                        )}
                      </Menu.Item>
                    </div>
                  </Menu.Items>
                </Transition>
              </Menu>
            ) : (
              <div className="flex items-center space-x-2">
                <Link
                  to="/login"
                  className="px-4 py-2 text-sm font-medium text-slate-700 dark:text-slate-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="px-5 py-2 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all shadow-md hover:shadow-lg"
                >
                  Get Started
                </Link>
              </div>
            )}

            {/* Mobile menu button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2.5 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? (
                <XMarkIcon className="h-6 w-6" />
              ) : (
                <Bars3Icon className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <Transition
        show={isMobileMenuOpen}
        as={Fragment}
        enter="transition ease-out duration-200"
        enterFrom="transform opacity-0 scale-95"
        enterTo="transform opacity-100 scale-100"
        leave="transition ease-in duration-150"
        leaveFrom="transform opacity-100 scale-100"
        leaveTo="transform opacity-0 scale-95"
      >
        <div className="md:hidden bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 max-h-[calc(100vh-4rem)] overflow-y-auto">
          <div className="px-4 py-4 space-y-1">

            {/* Navigation items */}
            {navItems.map((item) => {
              const isActive = isNavActive(item.href);
              if (item.subItems) {
                return (
                  <div key={item.name} className="space-y-1">
                    <div className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-medium ${
                      isActive ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400' : 'text-slate-700 dark:text-slate-300'
                    }`}>
                      <item.icon className={`h-5 w-5 mr-3 ${
                        isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                      }`} />
                      {item.name}
                    </div>
                    <div className="ml-6 space-y-1 border-l-2 border-slate-200 dark:border-slate-700 pl-3">
                      {item.subItems.map((subItem) => {
                        const isSubActive = location.pathname === subItem.href || location.pathname.startsWith(subItem.href + '/');
                        return (
                          <Link
                            key={subItem.href}
                            to={subItem.href}
                            onClick={() => setIsMobileMenuOpen(false)}
                            className={`block px-3 py-2 rounded-lg text-sm ${
                              isSubActive
                                ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400'
                                : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-700'
                            }`}
                          >
                            {subItem.name}
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                );
              }
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className={`flex items-center px-4 py-3.5 rounded-xl text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 dark:bg-blue-900/20 text-blue-700 dark:text-blue-400'
                      : 'text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800'
                  }`}
                >
                  <item.icon className={`h-5 w-5 mr-3 ${
                    isActive ? 'text-blue-600 dark:text-blue-400' : 'text-slate-400'
                  }`} />
                  {item.name}
                </Link>
              );
            })}

            {/* Mobile auth buttons */}
            {!isAuthenticated && (
              <div className="pt-4 border-t border-slate-200 dark:border-slate-700 space-y-2">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-xl transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="block w-full text-center px-4 py-3 text-sm font-medium text-white bg-gradient-to-r from-blue-600 to-blue-700 rounded-xl hover:from-blue-700 hover:to-blue-800 transition-all"
                >
                  Get Started
                </Link>
              </div>
            )}
          </div>
        </div>
      </Transition>
    </nav>
  );
};

export default Navbar;