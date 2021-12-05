// Third-party libraries
const mongoose = require('mongoose');

const contactSchema = mongoose.Schema(
  {
    name: {
      type: String,
      require: true,
    },
    subject: {
      type: String,
      require: true,
    },
    message: {
      type: String,
      require: true,
    },
    email: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

contactSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

contactSchema.index({
  name: 'text',
  subject: 'text',
  email: 'text',
  message: 'text',
});

module.exports = mongoose.model('Contact', contactSchema);
