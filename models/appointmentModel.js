const mongoose = require('mongoose');

const Schema = mongoose.Schema;

const appointmentSchema = new Schema(
  {
    client: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    employee: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    address: { type: String, required: true, minlength: 6 },
    description: {
      type: String,
    },
    status: {
      type: String,
      enum: ['accepted', 'canceled', 'in_revision'],
      default: 'in_revision',
    },
  },
  { timestamps: true }
);

appointmentSchema.virtual('contract', {
  ref: 'Contract',
  localField: '_id',
  foreignField: 'appointment',
  justOne: true,
});

/* appointmentSchema.pre(/^find/, function (next) {
  this.populate('employee', 'username name id').populate(
    'client',
    'username name id'
  );
  next();
}); */

appointmentSchema.method('toClient', function () {
  const obj = this.toObject({ getters: true });

  if (obj.employee) {
    delete obj.employee.city;
    delete obj.employee._id;
  }

  if (obj.client) {
    delete obj.client.city;
    delete obj.client._id;
  }

  if (obj.contract) {
    delete obj.contract._id;
  }

  delete obj._id;

  return obj;
});

appointmentSchema.index({
  address: 'text',
  description: 'text',
});

module.exports = mongoose.model('Appointment', appointmentSchema);
