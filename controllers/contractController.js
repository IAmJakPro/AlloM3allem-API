// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');
const appError = require('../utils/appError');

// Models
const Contract = require('../models/contractModel');
const Appointment = require('../models/appointmentModel');
const User = require('../models/userModel');
const filterObj = require('../utils/filterObj');

/**
 * Create a Contract
 */
exports.createContract = factory.createOne(
  Contract,
  {
    toAllow: false,
    user: ['status', 'acceptedAt'],
  },
  asyncHandler(async (doc) => {
    // Mark the appointment as accepted
    const appointment = await Appointment.findByIdAndUpdate(doc.appointment, {
      status: 'accepted',
    });

    // Notify the client
    const user = await User.findById(appointment.client);
    await user.notify('contract', {
      message: {
        fr: `${req.user.name} a accepté votre demande de service et il a créé un contrat`,
        ar: `وافق ${req.user.name} على طلب الخدمة الخاص بك وقام بإنشاء عقد`,
      },
      contract_id: doc._id,
      appointment_id: appointment._id,
    });
  })
);

/**
 * Accept the contract
 */
exports.acceptContract = asyncHandler(async (req, res, next) => {
  const contract = await Contract.findByIdAndUpdate(
    { _id: req.params.id, client: req.user.id },
    {
      status: 'accepted',
    }
  );

  if (!contract) {
    return next(
      new appError(
        "Couldn't find a contract, or you don't have permission",
        404
      )
    );
  }

  const user = await User.findById(contract.employee);
  await user.notify('contract', {
    message: {
      fr: `${req.user.name} a accepté votre contrat`,
      ar: `لقد قام ${req.user.name} بقبول عقدك`,
    },
    contract_id: contract._id,
  });

  res.status(200).json({
    status: 'success',
    data: contract.toClient(),
  });
});

/**
 * Update my contract
 */
exports.updateMyContract = asyncHandler(async (req, res, next) => {
  const filteredBody = filterObj(
    req.body,
    false,
    'status',
    'acceptedAt',
    'employee',
    'client',
    'appointment'
  );
  const contract = await Contract.findByIdAndUpdate(
    {
      _id: req.params.id,
      employee: req.user.id,
    },
    filteredBody
  );

  if (!contract) {
    return next(
      new appError(
        "Couldn't find a contract, or you don't have permission",
        404
      )
    );
  }

  const user = await User.findById(contract.client);

  await user.notify('contract', {
    message: {
      fr: `${req.user.name} a mis à jour votre contrat`,
      ar: `قام ${req.user.name} بتحديث عقدك`,
    },
    contract_id: contract._id,
  });

  res.status(200).json({
    status: 'success',
    data: contract.toClient(),
  });
});

exports.getMyContract = factory.getAll(Contract, {
  toPopulate: [
    { path: 'appointment', select: 'id' },
    { path: 'employee client', select: 'name username' },
    { path: 'service', select: 'name' },
  ],
});

/**
 * Update a single Contract
 */
exports.updateContract = factory.updateOne(Contract);

/**
 * Get a single Contract
 */
exports.getContract = factory.getOne(Contract, {
  searchFields: ['price', 'workType', 'service', 'summary', 'status'],
});

/**
 * Get all categories
 */
exports.getAllContracts = factory.getAll(Contract, {
  toPopulate: [
    {
      path: 'employee client',
      select: 'username name id',
    },
    {
      path: 'service',
      select: 'name',
    },
  ],
});

/**
 * Delete a single Contract
 */
exports.deleteContract = factory.deleteOne(Contract);
