// Third-party libraries
const bcrypt = require('bcryptjs');
const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const adminSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      minLength: 3,
      maxLength: 50,
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true, minlength: 6 },
    role: {
      type: String,
      enum: ['admin', 'viewer', 'super_admin'],
      default: 'admin',
    },
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

adminSchema.pre('save', async function (next) {
  // Only run the encryption if the password is modified.
  if (!this.isModified('password')) {
    return next();
  }

  // Encrypt the password with BCRYPT Algorithm.
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

adminSchema.methods.isPasswordCorrect = async function (
  password,
  userPassword
) {
  return await bcrypt.compare(password, userPassword);
};

adminSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  delete obj._id;

  return obj;
});

adminSchema.index({ name: 'text', email: 'text' });

module.exports = mongoose.model('Admin', adminSchema);
