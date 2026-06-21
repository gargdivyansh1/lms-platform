const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const instructorController = require('../controllers/instructor.controller');
const { auth, isInstructor } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const upload = require('../middleware/upload'); // Add this line

// All instructor routes require authentication and instructor role
router.use(auth, isInstructor);

// Dashboard
router.get('/dashboard/stats', instructorController.getDashboardStats);
router.get('/dashboard/recent-activity', instructorController.getRecentActivity);

// Course Management
router.get('/courses', instructorController.getMyCourses);
router.get('/courses/:id', instructorController.getCourseDetails);
router.post(
  '/courses',
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('category').optional().isString()
  ],
  validateRequest,
  instructorController.createCourse
);
router.put(
  '/courses/:id',
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('category').optional().isString()
  ],
  validateRequest,
  instructorController.updateCourse
);
router.delete('/courses/:id', instructorController.deleteCourse);
router.post('/courses/:id/publish', instructorController.publishCourse);
router.post('/courses/:id/archive', instructorController.archiveCourse);

// Module Management
router.post(
  '/courses/:courseId/modules',
  [
    body('title').notEmpty().withMessage('Module title is required'),
    body('content').notEmpty().withMessage('Module content is required'),
    body('order').optional().isInt()
  ],
  validateRequest,
  instructorController.createModule
);
router.put(
  '/modules/:moduleId',
  [
    body('title').optional().notEmpty(),
    body('content').optional().notEmpty(),
    body('order').optional().isInt()
  ],
  validateRequest,
  instructorController.updateModule
);
router.delete('/modules/:moduleId', instructorController.deleteModule);

// Student Management
router.get('/courses/:courseId/students', instructorController.getCourseStudents);
router.get('/students/:studentId/progress', instructorController.getStudentProgress);
router.get('/students/:studentId/assignments', instructorController.getStudentAssignments);

// Assignment Management
router.post(
  '/courses/:courseId/assignments',
  [
    body('title').notEmpty().withMessage('Assignment title is required'),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601(),
    body('maxScore').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  instructorController.createAssignment
);
router.get('/assignments/:assignmentId/submissions', instructorController.getAssignmentSubmissions);
router.put(
  '/submissions/:submissionId/grade',
  [
    body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
    body('feedback').optional().isString()
  ],
  validateRequest,
  instructorController.gradeSubmission
);

// Analytics
router.get('/analytics/overview', instructorController.getAnalyticsOverview);
router.get('/analytics/course/:courseId', instructorController.getCourseAnalytics);

// Communication
router.post(
  '/courses/:courseId/announcement',
  [
    body('title').notEmpty().withMessage('Announcement title is required'),
    body('message').notEmpty().withMessage('Announcement message is required')
  ],
  validateRequest,
  instructorController.sendAnnouncement
);

module.exports = router;