// Third-party libraries
const mongoose = require('mongoose');
const slugify = require('slugify');

// Utils
const keySlugify = require('../utils/slugifyKey');
const { deleteImage } = require('../utils/uploadHelper');

const Schema = mongoose.Schema;

const serviceSchema = new Schema(
  {
    _id: String,
    key: {
      fr: { type: String, require: true, unique: true },
      ar: { type: String, require: true, unique: true },
    },
    name: {
      fr: { type: String, require: true, unique: true },
      ar: { type: String, require: true, unique: true },
    },
    image: String,
    isActive: {
      type: Boolean,
      default: true,
    },
    searches: [
      {
        ip: String,
        searchedAt: Date,
        user: { type: Schema.ObjectId, ref: 'User' },
      },
    ],
  },
  { timestamps: true }
);

// Set the keys and _id with slugified name
serviceSchema.path('name.fr').set(function (v) {
  this._id = slugify(v, {
    replacement: '_',
    lower: true,
    trim: true,
  });
  if (this.key) this.key.fr = keySlugify(v);
  return v;
});

serviceSchema.path('name.ar').set(function (v) {
  if (this.key) this.key.ar = keySlugify(v);
  return v;
});

/* serviceSchema.pre('save', async function (next) {
  if (!this.isModified('image')) {
    return next();
  }

  next();
}); */

// Automatically delete the image from google cloud storage id a service is deleted
serviceSchema.post('findOneAndDelete', async function (doc) {
  await deleteImage(`services/${doc._id.toString()}`);
});

serviceSchema.method('toClient', function (isAdmin, lang) {
  const obj = this.toObject({ getters: true });
  if (lang) {
    obj.name = obj.name[lang];
  }

  if (!isAdmin) {
    const { id, name, image } = obj;
    return { id, name, image };
  }

  //Rename fields
  delete obj._id;

  return obj;
});

serviceSchema.index({
  'name.fr': 'text',
  'name.ar': 'text',
});

module.exports = mongoose.model('Service', serviceSchema);
