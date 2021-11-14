const mongoose = require('mongoose');

const pageSchema = mongoose.Schema({
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
    required: true,
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
});

pageSchema.path('title.fr').set(function (v) {
  this.slug = slugify(v, {
    lower: true,
    trim: true,
  });
  return v;
});

pageSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Page', pageSchema);
