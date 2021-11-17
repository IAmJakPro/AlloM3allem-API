// Third-party libraries
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const reportSchema = new Schema({
  email: { type: String, required: true, unique: true },
  type: {
    type: String,
    enum: [
      'duplicate',
      'scam',
      'wrong_category',
      'bad_image',
      'wrong_number',
      'other',
    ],
    default: 'other',
  },
  description: {
    type: String,
  },
  reviewed: {
    type: Boolean,
    default: false,
  },
});

reportSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

reportSchema.index({
  description: 'text',
  type: 'text',
  email: 'text',
});

module.exports = mongoose.model('Report', reportSchema);
