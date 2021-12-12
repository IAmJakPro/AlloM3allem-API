// Third-party libraries
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const settingSchema = new Schema({
  title: {
    fr: { type: String, required: true },
    ar: { type: String, required: true },
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
    linkedIn: String,
    youtube: String,
    whatsapp: String,
  },
  apps: {
    android: String,
    iphone: String,
  },
  maintenance_mode: {
    type: Boolean,
    defaut: false,
  },
  tracking: {
    inside_head: String,
    body_start: String,
    body_end: String,
  },
  seo: {
    description: {
      fr: String,
      ar: String,
    },
    url: String,
    keywords: String,
  },
});

settingSchema.method('toClient', function (isAdmin, lang) {
  let obj = this.toObject({ getters: true });
  if (lang) {
    if (obj.title) {
      obj.title = obj.title[lang];
    }
    if (obj.address) {
      obj.address = obj.address[lang];
    }
    if (obj.seo && obj.seo.description) { 
      if (obj.seo.description) {
        obj.seo.description = obj.seo.description[lang];
      }
    }
  }

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Setting', settingSchema);
