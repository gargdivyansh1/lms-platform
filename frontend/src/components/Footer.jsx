// frontend/src/components/Footer.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import {
  AcademicCapIcon,
  BookOpenIcon,
  HeartIcon,
  EnvelopeIcon,
  MapPinIcon,
  PhoneIcon,
  ArrowRightIcon,
  SparklesIcon,
  UserGroupIcon,
  ClipboardDocumentListIcon,
  HomeIcon,
  CogIcon,
  ShieldCheckIcon,
  UserIcon, 
} from '@heroicons/react/24/outline';

const Footer = () => {
  const currentYear = new Date().getFullYear();
  const { isAuthenticated, isInstructor, isAdmin, user } = useAuth();

  // Get role-specific quick links
  const getQuickLinks = () => {
    const links = [];

    // Common links for authenticated users
    if (isAuthenticated) {
      // For instructors
      if (isInstructor) {
        links.push(
          { name: 'Dashboard', href: '/instructor', icon: HomeIcon },
          { name: 'My Courses', href: '/instructor/courses', icon: BookOpenIcon },
          { name: 'Students', href: '/instructor/students', icon: UserGroupIcon },
          { name: 'Assignments', href: '/instructor/assignments', icon: ClipboardDocumentListIcon }
        );
      }
      // For admins
      else if (isAdmin) {
        links.push(
          { name: 'Dashboard', href: '/admin', icon: ShieldCheckIcon },
          { name: 'Users', href: '/admin/users', icon: UserGroupIcon },
          { name: 'Courses', href: '/admin/courses', icon: BookOpenIcon }
        );
      }
      // For students
      else {
        links.push(
          { name: 'Dashboard', href: '/student', icon: AcademicCapIcon },
          { name: 'My Courses', href: '/my-courses', icon: BookOpenIcon },
          { name: 'Assignments', href: '/assignments', icon: ClipboardDocumentListIcon },
          { name: 'Wishlist', href: '/student/wishlist', icon: HeartIcon }
        );
      }
    } else {
      // Public links
      links.push(
        { name: 'Home', href: '/', icon: HomeIcon },
        { name: 'Courses', href: '/courses', icon: BookOpenIcon }
      );
    }

    // Always add settings if authenticated
    if (isAuthenticated) {
      const settingsPath = isAdmin ? '/admin/settings' : isInstructor ? '/instructor/settings' : '/student/settings';
      links.push({ name: 'Settings', href: settingsPath, icon: CogIcon });
    }

    return links;
  };

  const quickLinks = getQuickLinks();

  const socialLinks = [
    { name: 'GitHub', href: 'https://github.com/gargdivyansh1/lms-platform' },
    { name: 'Twitter', href: '#' },
    { name: 'LinkedIn', href: 'https://www.linkedin.com/in/divyansh-garg515/' },
    { name: 'YouTube', href: '#' }
  ];

  return (
    <footer className="bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800">
      {/* Main Footer */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
          {/* Brand Section */}
          <div className="space-y-4">
            <Link to="/" className="flex items-center space-x-3 group">
              <div className="bg-gradient-to-br from-blue-600 to-blue-700 p-2 rounded-xl shadow-md group-hover:shadow-lg transition-all duration-300 group-hover:scale-105">
                <AcademicCapIcon className="h-8 w-8 text-white" />
              </div>
              <div>
                <span className="text-xl font-bold bg-gradient-to-br from-blue-600 to-blue-700 bg-clip-text text-transparent dark:from-blue-400 dark:to-blue-300">
                  LearnHub
                </span>
                <span className="block text-[10px] text-slate-400 dark:text-slate-500 font-medium tracking-wider uppercase -mt-0.5">
                  Learning Platform
                </span>
              </div>
            </Link>
            <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed max-w-sm">
              Empowering learners worldwide with quality education and career growth opportunities.
            </p>
            {isAuthenticated && (
              <div className="flex items-center gap-2 text-sm text-slate-500 dark:text-slate-400">
                <UserIcon className="h-4 w-4 text-blue-500" />
                <span>Welcome back, {user?.name?.split(' ')[0] || 'Learner'}!</span>
              </div>
            )}
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <ArrowRightIcon className="h-4 w-4 text-blue-500" />
              Quick Links
            </h4>
            <ul className="space-y-2.5">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link
                    to={link.href}
                    className="group flex items-center text-sm text-slate-600 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
                  >
                    <link.icon className="h-4 w-4 mr-2 text-slate-400 group-hover:text-blue-500 transition-colors" />
                    {link.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact Info */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <EnvelopeIcon className="h-4 w-4 text-blue-500" />
              Contact
            </h4>
            <ul className="space-y-2.5 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-2">
                <EnvelopeIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>lmsplatform515@gmail.com</span>
              </li>
              <li className="flex items-start gap-2">
                <PhoneIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>+91-7617449174</span>
              </li>
              <li className="flex items-start gap-2">
                <MapPinIcon className="h-4 w-4 text-slate-400 mt-0.5 flex-shrink-0" />
                <span>Mathura, UP</span>
              </li>
            </ul>
          </div>

          {/* Social Links */}
          <div>
            <h4 className="text-sm font-semibold text-slate-900 dark:text-white mb-4 flex items-center gap-2">
              <UserGroupIcon className="h-4 w-4 text-blue-500" />
              Connect With Us
            </h4>
            <div className="flex flex-wrap gap-3">
              {socialLinks.map((social) => (
                <a
                  key={social.name}
                  href={social.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex items-center gap-2 px-4 py-2 bg-slate-50 dark:bg-slate-800 rounded-xl hover:bg-blue-50 dark:hover:bg-blue-900/20 transition-all hover:shadow-md"
                >
                  <span className="text-lg">{social.icon}</span>
                  <span className="text-sm text-slate-600 dark:text-slate-400 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                    {social.name}
                  </span>
                </a>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Bar */}
      <div className="border-t border-slate-200 dark:border-slate-800">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="text-sm text-slate-500 dark:text-slate-400">
              &copy; {currentYear} LearnHub. All rights reserved.
            </div>
            <div className="flex flex-wrap items-center gap-4 text-sm">
              <Link to="/privacy" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Privacy Policy
              </Link>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700"></span>
              <Link to="/terms" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Terms of Service
              </Link>
              <span className="w-px h-4 bg-slate-300 dark:bg-slate-700"></span>
              <Link to="/help" className="text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition-colors">
                Help Center
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;