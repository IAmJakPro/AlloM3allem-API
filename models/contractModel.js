const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const contractSchema = Schema(
  {
    appointment: {
      type: Schema.ObjectId,
      ref: 'Appointment',
    },
    employee: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    client: {
      type: Schema.ObjectId,
      ref: 'User',
      required: true,
    },
    price: {
      type: Number,
      required: true,
    },
    workType: {
      type: String,
      required: true,
      enum: ['byDay', 'byProject'],
    },
    service: {
      type: String,
      ref: 'Service',
      required: true,
    },
    summary: {
      type: String,
      required: true,
    },
    acceptedAt: {
      type: Date,
    },
    startAt: {
      type: Date,
      required: true,
    },
    finishAt: {
      type: Date,
      required: true,
    },
    status: {
      type: String,
      enum: ['accepted', 'refused', 'in_revision'],
      default: 'in_revision',
    },
  },
  {
    timestamps: true,
  }
);

contractSchema.pre('save', function (next) {
  if (this.isModified('status') && this.status === 'accepted') {
    this.acceptedAt = new Date();
  }
  next();
});

contractSchema.pre(/^find/, function (next) {
  this.populate('appointment', 'id')
    .populate('employee', 'id name')
    .populate('client', 'id name')
    .populate('service', 'name');
  next();
});

contractSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  //Rename fields
  delete obj._id;

  return obj;
});

module.exports = mongoose.model('Contract', contractSchema);
