// Third-party libraries
const mongoose = require('mongoose');

const clientSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.ObjectId,
    ref: 'User',
    unique: true,
  },
});

clientSchema.pre(/^find/, function (next) {
  this.populate('user');
  next();
});

module.exports = mongoose.model('Client', clientSchema);
