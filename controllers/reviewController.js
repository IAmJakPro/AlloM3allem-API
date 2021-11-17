// Utils
const factory = require('../utils/factory');

// Models
const Review = require('../models/reviewModel');
const User = require('../models/userModel');
const asyncHandler = require('../utils/asyncHandler');

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
    const user = await User.findById(doc.rated);
    user.notify('review', {
      message: {
        fr: `Vous avez un nouvel avis de ${req.user.name}`,
        ar: `لديك تقييم جديد من ${req.user.name}`,
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
exports.updateReview = factory.updateOne(Review, {
  toAllow: false,
  user: ['status'],
});

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
