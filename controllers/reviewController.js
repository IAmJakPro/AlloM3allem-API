// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');

// Models
const Review = require('../models/reviewModel');
const User = require('../models/userModel');

/**
 * Create a single review
 */
exports.createReview = factory.createOne(
  Review,
  {
    toAllow: false,
    user: ['status'],
  },
  // Notify the rated user
  asyncHandler(async (doc) => {
    const rated = await User.findById(doc.rated);
    const rater = await User.findById(doc.rater).select('name');
    rated.notify('review', {
      message: {
        fr: `Vous avez un nouvel avis de ${rater.name}`,
        ar: `لديك تقييم جديد من ${rater.name}`,
      },
    });
  })
);

/**
 * Get the reviews I GOT
 */
exports.getMyGottenReviews = factory.getAll(Review, {
  searchFields: ['comment', 'status'],
  userFilters: { status: 'approved' },
});

/**
 * Get the reviews I GAVE
 */
exports.getMyGivenReviews = factory.getAll(Review);

/**
 * Get reviews by user id
 */
exports.getUserReviews = factory.getAll(Review);

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////

/**
 * Update a single Review
 */
exports.updateReview = factory.updateOne(
  Review,
  {
    toAllow: false,
    user: ['status'],
  },
  asyncHandler(async (doc) => {
    /* const stats = await Review.aggregate([
      {
        $match: { rated: doc.rated._id, status: 'approved' },
      },
      {
        $group: {
          _id: '$rated',
          ratingQty: { $sum: 1 },
          avgRating: { $avg: '$stars' },
        },
      },
    ]);

    console.log(stats); */

    await Review.calcAverageRating(doc.rated._id);
  })
);

/**
 * Get a single Review
 */
exports.getReview = factory.getOne(Review);

/**
 * Get all Reviews
 */
exports.getAllReviews = factory.getAll(Review, {
  searchFields: ['name', 'comment'],
});

/**
 * Delete a single Review
 */
exports.deleteReview = factory.deleteOne(Review);
