import React from 'react';
import { Link } from 'react-router-dom';

const Footer = () => {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="bg-white dark:bg-gray-800 border-t border-gray-200 dark:border-gray-700">
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          <div>
            <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-2">LMS Platform</h3>
            <p className="text-gray-600 dark:text-gray-400 text-sm">
              Empowering learners worldwide with quality education and career growth opportunities.
            </p>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Quick Links</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li><Link to="/courses" className="hover:text-blue-600 dark:hover:text-blue-400">Courses</Link></li>
              <li><Link to="/my-courses" className="hover:text-blue-600 dark:hover:text-blue-400">My Courses</Link></li>
              <li><Link to="/assignments" className="hover:text-blue-600 dark:hover:text-blue-400">Assignments</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-sm font-semibold text-gray-900 dark:text-white mb-2">Connect</h4>
            <ul className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">GitHub</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">Twitter</a></li>
              <li><a href="#" className="hover:text-blue-600 dark:hover:text-blue-400">LinkedIn</a></li>
            </ul>
          </div>
        </div>
        <div className="mt-8 pt-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
          &copy; {currentYear} LMS Platform. All rights reserved.
        </div>
      </div>
    </footer>
  );
};

export default Footer;