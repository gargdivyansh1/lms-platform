const express = require('express');
const router = express.Router();
const { body, query, param } = require('express-validator');
const courseController = require('../controllers/course.controller');
const { auth, isInstructor, isAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

// Public routes
router.get(
  '/',
  [
    query('page').optional().isInt({ min: 1 }),
    query('limit').optional().isInt({ min: 1, max: 100 }),
    query('search').optional().isString(),
    query('instructor').optional().isString()
  ],
  validateRequest,
  courseController.getCourses
);

router.get('/:id', courseController.getCourseById);

// Protected routes
router.post(
  '/',
  auth,
  isInstructor,
  [
    body('title').notEmpty().withMessage('Title is required'),
    body('description').notEmpty().withMessage('Description is required'),
    body('instructor').notEmpty().withMessage('Instructor is required')
  ],
  validateRequest,
  courseController.createCourse
);

router.put(
  '/:id',
  auth,
  isInstructor,
  [
    body('title').optional().notEmpty(),
    body('description').optional().notEmpty(),
    body('instructor').optional().notEmpty()
  ],
  validateRequest,
  courseController.updateCourse
);

router.delete(
  '/:id',
  auth,
  isInstructor,
  courseController.deleteCourse
);

router.post(
  '/recover/:id',
  auth,
  isInstructor,
  courseController.recoverCourse
);

module.exports = router;