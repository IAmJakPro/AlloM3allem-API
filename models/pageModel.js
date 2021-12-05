// Third-party libraries
const mongoose = require('mongoose');
const slugify = require('slugify');
const sanitizeHtml = require('sanitize-html');
const he = require('he');

const pageSchema = mongoose.Schema(
  {
    title: {
      fr: {
        type: String,
        required: true,
      },
      ar: {
        type: String,
        required: true,
      },
    },
    slug: {
      type: String,
      //required: true,
      unique: true,
    },
    body: {
      fr: {
        type: String,
        required: true,
      },
      ar: {
        type: String,
        required: true,
      },
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Set the slufg of image
pageSchema.path('title.fr').set(function (v) {
  this.slug = slugify(v, {
    lower: true,
    trim: true,
  });
  return v;
});

pageSchema.pre('findOneAndUpdate', async function (next) {
  this._update.body.fr = he.decode(this._update.body.fr);
  this._update.body.ar = he.decode(this._update.body.ar);
  console.log('second: ', this._update.body);
  //this._update.body.ar = sanitizeHtml(this._update.body.ar);
  //this._update.body.fr = sanitizeHtml(this._update.body.fr);
  next();
});

pageSchema.pre('save', function (next) {
  console.log('presaving...');
  this.body.fr = he.decode(this.body.fr);
  this.body.ar = he.decode(this.body.ar);
  //this.body.ar = sanitizeHtml(this.body.ar);
  //this.body.fr = sanitizeHtml(this.body.fr);
  next();
});

pageSchema.method('toClient', function (isAdmin, lang) {
  const obj = this.toObject({ getters: true });

  if (lang) {
    if (obj.title) {
      obj.title = obj.title[lang];
    }
    if (obj.body) {
      obj.body = obj.body[lang];
    }
  }

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Page', pageSchema);
