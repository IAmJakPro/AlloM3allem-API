const mongoose = require('mongoose');

const { Schema } = mongoose;

const searchSchema = new Schema(
  {
    ip: String,
    city: { type: String, ref: 'City' },
    service: { type: String, ref: 'Service' },
    user: { type: Schema.ObjectId, ref: 'User' },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Search', searchSchema);
