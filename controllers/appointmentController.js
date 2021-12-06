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
    const employee = await User.findById(doc.employee);
    const client = await User.findById(doc.client);
    await employee.notify('appointment', {
      image: client.image,
      message: {
        fr: `Vous avez reçu une nouvelle demande de service de ${client.name}`,
        ar: `لقد تلقيت طلب خدمة جديدًا من ${client.name}`,
      },
    });
  })
);

/**
 * Get my appointments
 */
exports.myAppointments = factory.getAll(Appointment, {
  toPopulate: [
    { path: 'contract' },
    { path: 'employee', select: 'name username phone' },
    { path: 'client', select: 'name username phone' },
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

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////
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
