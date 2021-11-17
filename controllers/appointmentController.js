// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');

// Models
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');

/**
 * Create a single Appointment
 */
exports.createAppointment = factory.createOne(
  Appointment,
  {
    toAllow: false,
    user: ['status'],
  },
  // Notify the employee
  asyncHandler(async (doc) => {
    const user = await User.findById(doc.employee);
    await user.notify('appointment', {
      message: {
        fr: `Vous avez reçu une nouvelle demande de service de ${req.user.name}`,
        ar: `لقد تلقيت طلب خدمة جديدًا من ${req.user.name}`,
      },
    });
  })
);

/**
 * Update a single Appointment
 */
exports.updateAppointment = factory.updateOne(Appointment);

/**
 * Get a single Appointment
 */
exports.getAppointment = factory.getOne(Appointment);

/**
 * Get all Appointments
 */
exports.getAllAppointments = factory.getAll(Appointment, {
  searchFields: ['address', 'description'],
});

/**
 * Delete a single Appointment
 */
exports.deleteAppointment = factory.deleteOne(Appointment);

/**
 * Get my appointments
 */
exports.myAppointments = factory.getAll(Appointment, {
  toPopulate: [
    { path: 'contract', select: 'id -appointment' },
    { path: 'employee', select: 'name username' },
    { path: 'client', select: 'name username' },
  ],
});
/* asyncHandler(async (req, res, next) => {
  const appointments = await Appointment.findOne({
    $or: [{ employee: req.user.id }, { client: req.user.id }],
  }).populate('contract');

  res.status(200).json({
    status: 'sucess',
    data: appointments,
  });
}); */
