const mongoose = require('mongoose');

const { Schema } = mongoose;

const searchSchema = new Schema(
  {
    ip: String,
    city: { type: String, ref: 'City' },
    service: { type: String, ref: 'Service' },
    foundResults: { type: Number, default: 0 },
    user: { type: Schema.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Search', searchSchema);
