// Third-party libraries
const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const { customAlphabet } = require('nanoid');
const slugify = require('slugify');

// Utils
const filterObj = require('../utils/filterObj');

// Models
const { Employee } = require('./employeeModel');
const Client = require('./clientModel');
const Notification = require('./notificationModel');

const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      validate: {
        validator: (val) => {
          const name = /<[a-z]+(\s)*.*\s*>[a-zA-Z0-9\s\n]*<\/[a-z]*>/;
          const result = val.match(name) ? false : true;
          return result;
        },
        message: 'name must has char A-Z',
      },
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    username: {
      type: String,
      //required: true,
      unique: true,
    },
    password: { type: String, required: true, minlength: 6, select: false },
    phone: {
      type: String,
      unique: true,
      required: true,
      trim: true,
      minlength: 10,
      maxlength: 13,
      validate: {
        validator: function (val) {
          const phoneVer = /^\(?(212|0)\)?[5-7]?([0-9]{8})$/;
          const rslt = val.match(phoneVer) ? true : false;
          return rslt;
        },
      },
    },
    city: {
      type: String,
      required: true,
      ref: 'City',
    },
    type: {
      type: String,
      required: true,
      enum: ['employee', 'client'],
    },
    image: {
      type: String,
      default: 'https://storage.googleapis.com/allom3allem1/users/avatar.png',
    },
    sexe: {
      type: String,
      enum: ['m', 'f', 'none'],
      default: 'none',
    },
    avgRating: {
      type: Number,
      default: 0,
      min: 0,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQty: {
      type: Number,
      min: 0,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'desactive', 'blocked', 'deleted'],
      default: 'desactive',
    },
    ip: String,
    lastLogInAt: Date,
    linkResetToken: String,
    linkResetTokenExpire: Date,
    passwordChangedAt: {
      type: Date,
      select: false,
    },
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true, getters: true },
  }
);

// Virtuals needed sometimes to get the related employee/client
userSchema.virtual('employee', {
  ref: 'Employee',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

userSchema.virtual('client', {
  ref: 'Client',
  localField: '_id',
  foreignField: 'user',
  justOne: true,
});

/* userSchema.path('name').set(function (v) {
  if (!v || v.length < 1) return v;
  const slugifiedName = slugify(v[0], {
    lower: true,
    trim: true,
  });
  const nanoid = customAlphabet('1234567890', 4);
  const generatedId = nanoid(4);
  const prefix = this.type === 'employee' ? 'e' : 'c';

  const username = `${prefix}-${slugifiedName}-${generatedId}`;

  this.username = username;

  return v;
}); */

userSchema.pre('findOneAndUpdate', async function (next) {
  // Only run the encryption if the password is modified.
  if (!this._update || !this._update.password) {
    return next();
  }

  // Encrypt the password with BCRYPT Algorithm.
  this._update.password = await bcrypt.hash(this._update.password, 12);
  this._update.passwordChangedAt = new Date(Date.now() + 1000);
  next();
});

// Document middleware, only works on save() and create()!
// Doesn't work on update() and insert()!
userSchema.pre('save', async function (next) {
  // Generate username
  const slugifiedName = slugify(this.name, {
    lower: true,
    trim: true,
  });
  const nanoid = customAlphabet('1234567890', 4);
  const generatedId = nanoid(4);
  const prefix = this.type === 'employee' ? 'e' : 'c';

  const username = `${prefix}-${slugifiedName}-${generatedId}`;
  // Setting the username
  this.username = username;

  // Automatically create an employee item in db
  if (this.type === 'employee') {
    await Employee.create({ user: this._id, workIn: [this.city] });
  }

  // Automatically create a client item in db
  if (this.type === 'client') {
    await Client.create({ user: this._id });
  }

  // Only run the encryption if the password is modified.
  if (this.isModified('password')) {
    // Encrypt the password with BCRYPT Algorithm.
    this.password = await bcrypt.hash(this.password, 12);
    this.passwordChangedAt = new Date(Date.now() + 1000);
    return next();
  }

  next();
});

// Delete employee/client docs from db if the user is deleted
userSchema.post('findOneAndDelete', async function (doc) {
  if (doc.type === 'employee') {
    await Employee.findOneAndDelete({ user: doc._id });
  }

  if (doc.type === 'client') {
    await Client.findOneAndDelete({ user: doc._id });
  }
});

// Method to notify the user
userSchema.method('notify', async function (type, data) {
  await Notification.create({
    type,
    data,
    notifiable: this._id,
  });
});

// This function gotten directly from HAMZA's project, not tested yet
userSchema.methods.generateResetNumber = function () {
  const sucretNumber = String(Math.trunc(Math.random() * 10000000));

  this.passwordResetToken = crypto
    .createHash('sha256')
    .update(sucretNumber)
    .digest('hex');

  this.passwordResetTokenExpire = Date.now() + 70 * 60 * 1000;
  return sucretNumber;
};
userSchema.methods.genResetTokenForLink = function () {
  const sucretToken = String(Math.trunc(Math.random() * 90228));

  this.linkResetToken = crypto
    .createHash('sha256')
    .update(sucretToken)
    .digest('hex');

  this.linkResetTokenExpire = Date.now() + 70 * 60 * 1000;
  return sucretToken;
};

userSchema.pre(/^find/, function (next) {
  this.populate('city', 'name');
  next();
});

userSchema.method('toClient', function (isAdmin, lang) {
  let obj = this.toObject({ getters: true });
  if (lang) {
    if (obj.city) {
      obj.city = obj.city.name[lang];
    }
    if (obj.type === 'employee') {
      if (obj.employee.workIn && obj.employee.workIn.length > 0) {
        let newWorkIn = [];
        for (const city of obj.employee.workIn) {
          newWorkIn.push(city.name[lang]);
        }
        obj.employee.workIn = newWorkIn;
      }
      if (obj.employee.service) {
        obj.employee.service = obj.employee.service.name[lang];
      }
    }
  }

  if (!isAdmin) {
    const filteredUser = filterObj(
      obj,
      false,
      '_id',
      //'id',
      'status',
      'updatedAt',
      'employee',
      'client'
    );
    let filteredProfile = {};
    if (obj.type === 'employee' && obj.employee) {
      filteredProfile = filterObj(
        obj.employee,
        false,
        'user',
        'createdAt',
        'updatedAt',
        'id',
        '_id'
      );
    }
    if (obj.type === 'client' && obj.client) {
      filteredProfile = filterObj(
        obj.client,
        false,
        'user',
        'createdAt',
        'updatedAt',
        'id',
        '_id'
      );
    }
    const clientObject = Object.assign(filteredUser, filteredProfile);
    return clientObject;
  }
  return obj;
});

// Check if password is correct
userSchema.methods.isPasswordCorrect = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.index({
  name: 'text',
  username: 'text',
  phone: 'text',
  city: 'text',
  type: 'text',
  status: 'text',
});

module.exports = mongoose.model('User', userSchema);
