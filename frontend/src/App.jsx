import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';

// Layouts
import MainLayout from './layouts/MainLayout';
import AdminLayout from './layouts/AdminLayout';
import InstructorLayout from './layouts/InstructorLayout';
import StudentLayout from './layouts/StudentLayout';

// Pages
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Courses from './pages/Courses';
import CourseDetails from './pages/CourseDetails';
import MyCourses from './pages/MyCourses';
import Assignments from './pages/Assignments';
import UploadAssignment from './pages/UploadAssignment';
import Profile from './pages/Profile';

// Admin Pages
import AdminDashboard from './pages/Admin/Dashboard';
import UserManagement from './pages/Admin/UserManagement';
import CourseManagement from './pages/Admin/CourseManagement';
import AdminAnalytics from './pages/Admin/Analytics';
import AdminSettings from './pages/Admin/Settings';

// Instructor Pages
import InstructorDashboard from './pages/Instructor/Dashboard';
import InstructorCourses from './pages/Instructor/Courses';
import InstructorCourseCreate from './pages/Instructor/CourseCreate';
import InstructorCourseEdit from './pages/Instructor/CourseEdit';
import InstructorStudents from './pages/Instructor/Students';
import InstructorAssignments from './pages/Instructor/Assignments';
import InstructorAnalytics from './pages/Instructor/Analytics';
import InstructorSettings from './pages/Instructor/Settings';

import StudentDetail from './pages/Instructor/StudentDetail';

// Student Pages
import StudentDashboard from './pages/Student/Dashboard';
import StudentMyCourses from './pages/Student/MyCourses';
import StudentCourseProgress from './pages/Student/CourseProgress';
import StudentAssignments from './pages/Student/Assignments';
import AssignmentSubmit from './pages/Student/AssignmentSubmit';
import StudentProgress from './pages/Student/Progress';
import StudentWishlist from './pages/Student/Wishlist';
import StudentSettings from './pages/Student/Settings';
import Certificates from './pages/Student/Certificates';

// Context
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 5 * 60 * 1000,
    },
  },
});

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router>
          <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                className: 'dark:bg-gray-800 dark:text-white',
              }}
            />
            <Routes>
              {/* Public Routes */}
              <Route path="/login" element={<Login />} />
              <Route path="/register" element={<Register />} />
              
              {/* Main Layout Routes */}
              <Route path="/" element={<MainLayout />}>
                <Route index element={<Home />} />
                <Route path="courses" element={<Courses />} />
                <Route path="courses/:id" element={<CourseDetails />} />
                
                {/* Protected Routes (Authenticated Users) */}
                <Route element={<ProtectedRoute />}>
                  <Route path="my-courses" element={<MyCourses />} />
                  <Route path="assignments" element={<Assignments />} />
                  <Route path="upload-assignment/:courseId" element={<UploadAssignment />} />
                  <Route path="profile" element={<Profile />} />
                </Route>
              </Route>
              
              {/* Admin Routes */}
              <Route path="/admin" element={<ProtectedRoute requiredRole="ADMIN" />}>
                <Route element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="users" element={<UserManagement />} />
                  <Route path="courses" element={<CourseManagement />} />
                  <Route path="analytics" element={<AdminAnalytics />} />
                  <Route path="settings" element={<AdminSettings />} />
                </Route>
              </Route>
              
              {/* Instructor Routes */}
              <Route path="/instructor" element={<ProtectedRoute requiredRole="INSTRUCTOR" />}>
                <Route element={<InstructorLayout />}>
                  <Route index element={<InstructorDashboard />} />
                  <Route path="courses" element={<InstructorCourses />} />
                  <Route path="courses/create" element={<InstructorCourseCreate />} />
                  <Route path="students/:id" element={<StudentDetail />} />
                  <Route path="courses/:id" element={<InstructorCourseEdit />} />
                  <Route path="students" element={<InstructorStudents />} />
                  <Route path="assignments" element={<InstructorAssignments />} />
                  <Route path="analytics" element={<InstructorAnalytics />} />
                  <Route path="settings" element={<InstructorSettings />} />
                </Route>
              </Route>

              {/* Student Routes */}
              <Route path="/student" element={<ProtectedRoute requiredRole="STUDENT" />}>
                <Route element={<StudentLayout />}>
                  <Route index element={<StudentDashboard />} />
                  <Route path="courses" element={<StudentMyCourses />} />
                  <Route path="courses/:id" element={<StudentCourseProgress />} />
                  <Route path="assignments" element={<StudentAssignments />} />
                  <Route path="assignments/:id/submit" element={<AssignmentSubmit />} />
                  <Route path="progress" element={<StudentProgress />} />
                  <Route path="wishlist" element={<StudentWishlist />} />
                  <Route path="settings" element={<StudentSettings />} />
                  <Route path="certificates" element={<Certificates />} />
                </Route>
              </Route>
              
              {/* 404 - Not Found */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </div>
        </Router>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;