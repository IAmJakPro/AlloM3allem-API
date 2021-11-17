// Third-party libraries
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const settingSchema = new Schema({
  title: {
    fr: String,
    ar: String,
  },
  description: {
    fr: String,
    ar: String,
  },
  email: String,
  address: {
    fr: String,
    ar: String,
  },
  phone: String,
  logo: String,
  icon: String,
  socials: {
    facebook: String,
    instagram: String,
    twitter: String,
  },
  maintenance_mode: {
    type: Boolean,
    defaut: false,
  },
});

settingSchema.method('toClient', function () {
  let obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Setting', settingSchema);
