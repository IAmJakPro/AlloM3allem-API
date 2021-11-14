const mongoose = require('mongoose');
const Review = require('../models/reviewModel');

const employeeSchema = mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.ObjectId,
      ref: 'User',
      unique: true,
    },
    age: {
      type: Number,
      min: 14,
      max: 150,
    },
    service: {
      type: String,
      ref: 'Service',
    },
    experience: {
      type: Number,
      min: 1,
      max: 100,
    },
    description: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
    workIn: [
      {
        type: String,
        ref: 'City',
      },
    ],
    portfolio: [
      {
        images: [String],
        title: String,
        description: String,
      },
    ],
  },
  {
    timestamps: true,
  }
);

employeeSchema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});

employeeSchema.method('toClient', function () {
  let obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Employee', employeeSchema);
