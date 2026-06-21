const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const assignmentController = require('../controllers/assignment.controller');
const { auth, isInstructor } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const upload = require('../middleware/upload');

// Student routes
router.get('/my-assignments', auth, assignmentController.getMyAssignments);
router.get('/:id', auth, assignmentController.getAssignmentById);
router.post(
  '/:id/submit',
  auth,
  upload.single('file'),
  [
    body('comment').optional().isString()
  ],
  validateRequest,
  assignmentController.submitAssignment
);

// Instructor routes
router.post(
  '/course/:courseId/create',
  auth,
  isInstructor,
  [
    body('title').notEmpty().withMessage('Assignment title is required'),
    body('description').optional().isString(),
    body('dueDate').optional().isISO8601(),
    body('maxScore').optional().isFloat({ min: 0 })
  ],
  validateRequest,
  assignmentController.createAssignment
);

router.get(
  '/:assignmentId/submissions',
  auth,
  isInstructor,
  assignmentController.getAssignmentSubmissions
);

router.put(
  '/:assignmentId/grade',
  auth,
  isInstructor,
  [
    body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
    body('feedback').optional().isString()
  ],
  validateRequest,
  assignmentController.gradeAssignment
);

module.exports = router;