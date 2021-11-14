const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const mongoose = require('mongoose');
const Employee = require('./employeeModel');
const Review = require('./reviewModel');
const Client = require('./clientModel');
const Notification = require('./notificationModel');
const { customAlphabet } = require('nanoid');
const slugify = require('slugify');

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
    password: { type: String, required: true, minlength: 6 },
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
    image: String,
    avgRating: {
      type: Number,
      default: 0,
      min: 1,
      max: 5,
      set: (val) => Math.round(val * 10) / 10,
    },
    ratingQty: {
      type: Number,
      min: 1,
      max: 5,
      default: 0,
    },
    status: {
      type: String,
      enum: ['active', 'desactive', 'blocked', 'deleted'],
      default: 'active',
    },
    linkResetToken: String,
    linkResetTokenExpire: Date,
    passwordChangedAt: Date,
    passwordResetToken: String,
    passwordResetTokenExpire: Date,
  },
  {
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true, getters: true },
  }
);

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

// Document middleware, only works on save() and create()!
// Doesn't work on update() and insert()!
userSchema.pre('save', async function (next) {
  const slugifiedName = slugify(this.name, {
    lower: true,
    trim: true,
  });
  const nanoid = customAlphabet('1234567890', 4);
  const generatedId = nanoid(4);
  const prefix = this.type === 'employee' ? 'e' : 'c';

  const username = `${prefix}-${slugifiedName}-${generatedId}`;

  this.username = username;

  if (this.type === 'employee') {
    await Employee.create({ user: this._id, workIn: [this.city] });
  }

  if (this.type === 'client') {
    await Client.create({ user: this._id });
  }

  // Only run the encryption if the password is modified.
  if (!this.isModified('password')) {
    return next();
  }

  // Encrypt the password with BCRYPT Algorithm.
  this.password = await bcrypt.hash(this.password, 12);
  this.passwordChangedAt = new Date(Date.now() + 1000);

  next();
});

userSchema.post('findOneAndDelete', async function (doc) {
  if (doc.type === 'employee') {
    await Employee.findOneAndDelete({ user: doc._id });
  }

  if (doc.type === 'client') {
    await Client.findOneAndDelete({ user: doc._id });
  }
});

userSchema.method('notify', async function (type, data) {
  await Notification.create({
    type,
    data,
    notifiable: this._id,
  });
});

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

userSchema.method('toClient', function (isAdmin) {
  let obj = this.toObject({ getters: true });

  if (!isAdmin) {
    if (obj.type === 'employee' && obj.hasOwnProperty('employee')) {
      obj = obj.employee;
    } else if (obj.type === 'client' && obj.hasOwnProperty('client')) {
      obj = obj.client;
    }
    delete obj._id;

    obj = { ...obj, ...obj.user };
    delete obj.user;
  }

  delete obj._id;

  return obj;
});

userSchema.methods.isPasswordCorrect = async function (password, userPassword) {
  return await bcrypt.compare(password, userPassword);
};

userSchema.index({
  name: 'text',
  username: 'text',
});

module.exports = mongoose.model('User', userSchema);
