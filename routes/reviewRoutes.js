// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Utils
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');

// Controllers
const reviewController = require('../controllers/reviewController');

// Models
const User = require('../models/userModel');

const router = express.Router();

//////////////// Public routes ////////////////

router.get(
  '/user/:id',

  /**
   * This simple middleware is for setting the id received from params as the rated id in the query,
   * So we can get only reviews gotten for the received id's user
   * We also added the status to query to return only approved reviews
   */
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rated'] = req.params.id;
    req.query['status'] = 'approved';
    next();
  },
  reviewController.getUserReviews
);

//////////////// User routes ////////////////

router.use(authMiddleware.checkLoggedUser);

router.get(
  '/gotten',

  /**
   * This simple middleware is for setting the rated to the id of the logged in use,
   * So we can get only gotten reviews of the logged in user
   * This middleware will be extracted later to "userMiddlewares"
   */
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rated'] = req.user.id;
    next();
  },

  reviewController.getMyGottenReviews
);

/**
 * This simple middleware is for setting the rated to the id of the logged in use,
 * So we can get only given reviews of the logged in user
 * This middleware will be extracted later to "userMiddlewares"
 */
router.get(
  '/given',
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['rater'] = req.user.id;
    next();
  },
  reviewController.getMyGivenReviews
);

router.post(
  '/',

  /**
   * This simple middleware to set the logged in user as the rater
   */
  (req, res, next) => {
    req.body.rater = req.user.id;
    /* const rated = await User.findOne({ username: req.body.username });
    if (!rated) {
      return next(new AppError('Could not find this user', 404));
    }
    if (req.user.id == rated.id) {
      return next(new AppError('Something went wrong', 500));
    }
    req.body.rated = rated.id; */
    next();
  },
  reviewController.createReview
);

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(reviewController.getAllReviews);

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
