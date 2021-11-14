const mongoose = require('mongoose');

const contactSchema = mongoose.Schema({
  name: {
    type: String,
  },
  subject: {
    type: String,
  },
  message: {
    type: String,
  },
  email: { type: String, required: true, unique: true },
});

contactSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Contact', contactSchema);
