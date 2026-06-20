const express = require('express');
const router = express.Router();
const { body, query } = require('express-validator');
const adminController = require('../controllers/admin.controller');
const { auth, isAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// All admin routes require authentication and admin role
router.use(auth, isAdmin);

// Dashboard & Analytics
router.get('/dashboard/stats', adminController.getDashboardStats);
router.get('/analytics/users', adminController.getUserAnalytics);
router.get('/analytics/courses', adminController.getCourseAnalytics);
router.get('/analytics/revenue', adminController.getRevenueAnalytics);
router.get('/analytics/engagement', adminController.getEngagementAnalytics);

// User Management
router.get('/users', adminController.getAllUsers);
router.get('/users/:id', adminController.getUserDetails);
router.put(
  '/users/:id/role',
  [
    body('role').isIn(['STUDENT', 'INSTRUCTOR', 'ADMIN']).withMessage('Invalid role')
  ],
  validateRequest,
  adminController.updateUserRole
);
router.put(
  '/users/:id/status',
  [
    body('status').isBoolean().withMessage('Status must be boolean')
  ],
  validateRequest,
  adminController.updateUserStatus
);
router.delete('/users/:id', adminController.deleteUser);
router.post('/users/:id/reset-password', adminController.resetUserPassword);

// Course Management
router.get('/courses', adminController.getAllCourses);
router.get('/courses/:id', adminController.getCourseDetails);
router.put(
  '/courses/:id',
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('instructor').optional().notEmpty(),
    body('status').optional().isIn(['DRAFT', 'PUBLISHED', 'ARCHIVED'])
  ],
  validateRequest,
  adminController.updateCourse
);
router.delete('/courses/:id', adminController.deleteCourse);
router.post('/courses/:id/recover', adminController.recoverCourse);
router.post('/courses/:id/feature', adminController.featureCourse);
router.post('/courses/:id/unfeature', adminController.unfeatureCourse);

// System Management
router.get('/system/health', adminController.getSystemHealth);
router.get('/system/logs', adminController.getSystemLogs);
router.post('/system/backup', adminController.createBackup);
router.post('/system/maintenance', adminController.toggleMaintenance);

// Reports
router.get('/reports/users', adminController.generateUserReport);
router.get('/reports/courses', adminController.generateCourseReport);
router.get('/reports/assignments', adminController.generateAssignmentReport);

// Notifications
router.post('/notifications', adminController.sendSystemNotification);

module.exports = router;