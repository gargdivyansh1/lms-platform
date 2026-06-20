const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const enrollmentController = require('../controllers/enrollment.controller');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

router.post(
  '/enroll',
  auth,
  [
    body('courseId').notEmpty().withMessage('Course ID is required')
  ],
  validateRequest,
  enrollmentController.enrollCourse
);

router.delete(
  '/unenroll/:courseId',
  auth,
  enrollmentController.unenrollCourse
);

router.get(
  '/my-courses',
  auth,
  enrollmentController.getMyCourses
);

router.put(
  '/progress',
  auth,
  [
    body('courseId').notEmpty(),
    body('progress').isInt({ min: 0, max: 100 })
  ],
  validateRequest,
  enrollmentController.updateProgress
);

module.exports = router;