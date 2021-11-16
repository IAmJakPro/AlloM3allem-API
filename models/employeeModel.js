const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');
const filterObj = require('../utils/filterObj');

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

employeeSchema.plugin(aggregatePaginate);

employeeSchema.post('aggregate', softDeleteAggregateMiddleware);

function softDeleteAggregateMiddleware(next) {
  // Get the current aggregation pipeline and prepend a `$match` that excludes
  // all soft-deleted docs
  this.pipeline().unshift(
    {
      $lookup: {
        from: 'users',
        localField: 'user',
        foreignField: '_id',
        as: 'user',
      },
    },
    {
      $unwind: '$user',
    },
    {
      $match: { 'user.status': 'active' },
    }
  );
  //next();
}

employeeSchema.pre(/^find/, async function (next) {
  this.populate('workIn', 'name').populate('service', 'name');
  next();
});

employeeSchema.method('toClient', function (isAdmin, lang) {
  let obj = this.toObject({ getters: true });
  /* 
  if (lang) {
    if (obj.workIn && obj.workIn.length > 0) {
      let newWorkIn = [];
      for (const city of obj.workIn) {
        newWorkIn.push(city.name[lang]);
      }
      obj.workIn = newWorkIn;
    }

    if (obj.service) {
      obj.service = obj.service.name[lang];
    }

    if (obj.user && obj.user.city) {
      obj.user.city = obj.user.city.name[lang];
    }
  }

  obj = Object.assign(
    filterObj(obj, false, 'id', '_id', 'user'),
    filterObj(obj.user, false, '_id', 'id', 'status')
  ); */

  return obj;
});

module.exports = mongoose.model('Employee', employeeSchema);
