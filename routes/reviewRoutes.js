// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const reviewController = require('../controllers/reviewController');

const router = express.Router();

// Routes below are restricted for logged in users
router.use(authMiddleware.checkLoggedUser);

router.get(
  '/my-gotten-reviews',
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
  '/my-given-reviews',
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
router.post('/', reviewController.createReview);

router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(reviewController.getAllReviews);

router
  .route('/:id')
  .get(reviewController.getReview)
  .patch(reviewController.updateReview)
  .delete(reviewController.deleteReview);

module.exports = router;
