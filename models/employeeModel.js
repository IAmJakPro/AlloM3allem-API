// Third-party libraries
const mongoose = require('mongoose');
const aggregatePaginate = require('mongoose-aggregate-paginate-v2');

// Utils
const filterObj = require('../utils/filterObj');
const { deleteImage } = require('../utils/uploadHelper');

const { Schema } = mongoose;

const profileVisitSchema = new Schema(
  {
    employee: { type: Schema.ObjectId, ref: 'User', required: true },
    visitor_ip: String,
    visitor: { type: Schema.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

const employeeSchema = new Schema(
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
      default: null,
    },
    service: {
      type: String,
      ref: 'Service',
      default: null,
    },
    experience: {
      type: Number,
      min: 1,
      max: 100,
      default: null,
    },
    description: {
      type: String,
      default: null,
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

// This plugin is for pagination in aggregate
employeeSchema.plugin(aggregatePaginate);

employeeSchema.pre('aggregate', onlyActiveUsers);

function onlyActiveUsers(next) {
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

  next();
}

employeeSchema.pre(/^find/, async function (next) {
  this.populate('workIn', 'name').populate('service', 'name');
  next();
});

employeeSchema.post('findOneAndDelete', async (doc) => {
  for (let portfolio of doc.portfolio) {
    for (let image of portfolio.images) {
      const splited = image.split('/');
      await deleteImage(`portfolio/${splited[splited.length - 1]}`);
    }
  }
});

employeeSchema.method('toClient', function (isAdmin, lang) {
  let obj = this.toObject({ getters: true });

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
    filterObj(obj, false, 'id', 'user'),
    filterObj(obj.user, false, '_id', 'status')
  );

  return obj;
});

/* module.exports = Object.assign(mongoose.model('Employee', employeeSchema), {
  ProfileVisit: mongoose.model(
    'ProfileVisit',
    profileVisitSchema
  )
}); */

const Employee = mongoose.model('Employee', employeeSchema);
const ProfileVisit = mongoose.model('ProfileVisit', profileVisitSchema);
module.exports = { Employee, ProfileVisit };

//exports.ProfileVisit = ProfileVisit;
