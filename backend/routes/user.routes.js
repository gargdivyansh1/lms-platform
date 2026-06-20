const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const userController = require('../controllers/user.controller');
const { auth, isAdmin } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');
const upload = require('../middleware/upload');

router.get('/', auth, isAdmin, userController.getAllUsers);

router.get('/:id', auth, userController.getUserById);

router.put(
  '/profile',
  auth,
  [
    body('name').optional().notEmpty(),
    body('email').optional().isEmail()
  ],
  validateRequest,
  userController.updateProfile
);

router.put(
  '/avatar',
  auth,
  upload.single('avatar'),
  userController.updateAvatar
);

router.get('/:id/enrollments', auth, userController.getUserEnrollments);

module.exports = router;