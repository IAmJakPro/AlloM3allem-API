const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reviewSchema = Schema(
  {
    stars: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    comment: {
      type: String,
      trim: true,
    },
    rated: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    rater: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    status: {
      type: String,
      enum: ['approved', 'disapproved', 'deleted'],
      default: 'approved',
    },
  },
  {
    timestamps: true,
  }
);

reviewSchema.statics.calcAverageRating = async function (userID) {
  const User = require('./userModel');
  const stats = await this.aggregate([
    {
      $match: { rated: userID, status: 'approved' },
    },
    {
      $group: {
        _id: '$rated',
        ratingQty: { $sum: 1 },
        avgRating: { $avg: '$stars' },
      },
    },
  ]);

  if (stats.length > 0) {
    await User.findByIdAndUpdate(userID, {
      avgRating: stats[0].avgRating,
      ratingQty: stats[0].ratingQty,
    });
  } else {
    await User.findByIdAndUpdate(userID, {
      avgRating: 0,
      ratingQty: 0,
    });
  }
};

reviewSchema.post('save', function () {
  // this points to current review
  this.constructor.calcAverageRating(this.rated);
});

// findByIdAndUpdate
// findByIdAndDelete
reviewSchema.pre(/^findOneAnd/, async function (next) {
  this.r = await this.findOne();

  next();
});

reviewSchema.post(/^findOneAnd/, async function () {
  await this.r.constructor.calcAverageRating(this.r.rated);
});

reviewSchema.pre(/^find/, function (next) {
  this.populate('rater', 'username id name image').populate(
    'rated',
    'username id name image'
  );
  next();
});

reviewSchema.method('toClient', function () {
  let obj = this.toObject({ getters: true });

  if (obj.rated) {
    delete obj.rated.city;
    delete obj.rated._id;
  }

  if (obj.rater) {
    delete obj.rater.city;
    delete obj.rater._id;
  }

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Review', reviewSchema);
