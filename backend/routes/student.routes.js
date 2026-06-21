const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const studentController = require('../controllers/student.controller');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const upload = require('../middleware/upload'); // Add this line

// All student routes require authentication
router.use(auth);

// Dashboard
router.get('/dashboard/stats', studentController.getDashboardStats);
router.get('/dashboard/recent-activity', studentController.getRecentActivity);

// Course Management
router.get('/my-courses', studentController.getMyCourses);
router.get('/courses/:id/progress', studentController.getCourseProgress);
router.post(
  '/courses/:id/complete-module',
  [
    body('moduleId').notEmpty().withMessage('Module ID is required')
  ],
  validateRequest,
  studentController.completeModule
);

// Assignment Management
router.get('/assignments', studentController.getMyAssignments);
router.post(
  '/assignments/:id/submit',
  upload.single('file'),
  [
    body('comment').optional().isString()
  ],
  validateRequest,
  studentController.submitAssignment
);

// Progress Tracking
router.get('/progress/overall', studentController.getOverallProgress);
router.get('/certificates', studentController.getCertificates);
router.post('/courses/:id/certificate', studentController.generateCertificate);

// Wishlist / Bookmarks
router.get('/wishlist', studentController.getWishlist);
router.post(
  '/wishlist',
  [
    body('courseId').notEmpty().withMessage('Course ID is required')
  ],
  validateRequest,
  studentController.addToWishlist
);
router.delete('/wishlist/:courseId', studentController.removeFromWishlist);

// Reviews
router.post(
  '/courses/:id/review',
  [
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
    body('comment').optional().isString()
  ],
  validateRequest,
  studentController.addReview
);
router.get('/courses/:id/reviews', studentController.getCourseReviews);

// Notifications
router.get('/notifications', studentController.getNotifications);
router.put('/notifications/:id/read', studentController.markNotificationRead);
router.put('/notifications/read-all', studentController.markAllNotificationsRead);

// Profile
router.put('/profile', studentController.updateProfile);
router.post('/avatar', upload.avatar, studentController.updateAvatar);
router.get('/statistics', studentController.getPersonalStatistics);

module.exports = router;