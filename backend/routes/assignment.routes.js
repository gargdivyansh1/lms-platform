const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const assignmentController = require('../controllers/assignment.controller');
const { auth, isInstructor } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.post(
  '/upload/:courseId',
  auth,
  upload.single('file'),
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').optional()
  ],
  validateRequest,
  assignmentController.uploadAssignment
);

router.get(
  '/course/:courseId',
  auth,
  assignmentController.getCourseAssignments
);

router.get(
  '/my-assignments',
  auth,
  assignmentController.getMyAssignments
);

router.put(
  '/grade/:assignmentId',
  auth,
  isInstructor,
  [
    body('grade').isFloat({ min: 0, max: 100 }).withMessage('Grade must be between 0 and 100'),
    body('feedback').optional()
  ],
  validateRequest,
  assignmentController.gradeAssignment
);

module.exports = router;