// Third-party libraries
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

contractSchema.pre('findOneAndUpdate', function (next) {
  if (this._update.status && this._update.status === 'accepted') {
    this._update.acceptedAt = new Date();
  }
  next();
});

/* contractSchema.pre(/^find/, function (next) {
  this.populate('appointment', 'id')
    .populate('employee', 'id name')
    .populate('client', 'id name')
    .populate('service', 'name');
  next();
}); */

contractSchema.method('toClient', function (isAdmin, lang) {
  const obj = this.toObject({ getters: true });
  if (obj.employee) {
    delete obj.employee.city;
    delete obj.employee._id;
  }

  if (obj.client) {
    delete obj.client.city;
    delete obj.client._id;
  }

  if (obj.service) {
    if (lang) {
      obj.service = obj.service.name[lang];
    }
    delete obj.service._id;
  }

  if (obj.appointment) {
    delete obj.appointment._id;
  }
  //Rename fields
  delete obj._id;

  return obj;
});

contractSchema.index({
  price: 'text',
  workType: 'text',
  service: 'text',
  summary: 'text',
  status: 'text',
});

module.exports = mongoose.model('Contract', contractSchema);
