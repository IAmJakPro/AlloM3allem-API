// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const reviewController = require('../controllers/reviewController');

// Models
const User = require('../models/userModel');
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

const router = express.Router();

router.get(
  '/user/:id',
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rated'] = req.params.id;
    next();
  },
  reviewController.getUserReviews
);

// Routes below are restricted for logged in users
router.use(authMiddleware.checkLoggedUser);

router.get(
  '/gotten',
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rated'] = req.user.id;
    req.query['status'] = 'approved';
    next();
  },
  reviewController.getMyGottenReviews
);
router.get(
  '/given',
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rater'] = req.user.id;
    req.query['status'] = 'approved';
    next();
  },
  reviewController.getMyGivenReviews
);
router.post(
  '/',
  asyncHandler(async (req, res, next) => {
    req.body.rater = req.user.id;
    const rated = await User.findOne({ username: req.body.username });
    if (!rated) {
      return next(new AppError('Could not find this user', 404));
    }
    if (req.user.id == rated.id) {
      return next(new AppError('Something went wrong', 500));
    }
    req.body.rated = rated.id;
    next();
  }),
  reviewController.createReview
);

router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
