// Third-party libraries
const mongoose = require('mongoose');
const slugify = require('slugify');

// Utils
const keySlugify = require('../utils/slugifyKey');

const Schema = mongoose.Schema;

const citySchema = new Schema(
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
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

// Set the keys and _id with slugified name
citySchema.path('name.fr').set(function (v) {
  this._id = slugify(v, {
    replacement: '_',
    lower: true,
    trim: true,
  });
  if (this.key) this.key.fr = keySlugify(v);
  return v;
});

citySchema.path('name.ar').set(function (v) {
  if (this.key) this.key.ar = keySlugify(v);
  return v;
});

citySchema.method('toClient', function (isAdmin, lang) {
  const obj = this.toObject({ getters: true });
  if (lang) {
    obj.name = obj.name[lang];
  }

  if (!isAdmin) {
    const { name, id } = obj;
    return { id, name };
  }

  //Rename fields
  delete obj._id;

  return obj;
});

citySchema.index({
  'name.fr': 'text',
  'name.ar': 'text',
});

module.exports = mongoose.model('City', citySchema);
