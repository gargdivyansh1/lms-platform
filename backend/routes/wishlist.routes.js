const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const wishlistController = require('../controllers/wishlist.controller');
const { auth } = require('../middleware/auth');
const { validateRequest } = require('../middleware/validate');

router.use(auth);

router.get('/', wishlistController.getWishlist);
router.post(
  '/',
  [
    body('courseId').notEmpty().withMessage('Course ID is required')
  ],
  validateRequest,
  wishlistController.addToWishlist
);
router.delete('/:courseId', wishlistController.removeFromWishlist);
router.get('/check/:courseId', wishlistController.checkWishlist);

module.exports = router;