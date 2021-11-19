// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Utils
const AppError = require('../utils/appError');

// Controllers
const contractController = require('../controllers/contractController');
const asyncHandler = require('../utils/asyncHandler');

// Models
const Appointment = require('../models/appointmentModel');

const router = express.Router();

//////////////// User routes ////////////////

router.use(authMiddleware.checkLoggedUser);

// Employees only routes

/**
 * To accept the appointment, Employee should create a contract and the appointment related to this contracr will automatically set as accepted
 */
router.post(
  '/',
  authMiddleware.routeGuard('employee'),
  userMiddleware.getMeInBody,
  asyncHandler(async (req, res, next) => {
    if (req.body.appointment) {
      const appointment = await Appointment.findById(req.body.appointment);
      if (!appointment) {
        return next(new AppError('This job request is not exists', 404));
      }
      req.body.client = appointment.client._id || appointment.client;
    }
    next();
  }),
  contractController.createContract
);

router.get(
  '/my-contracts',
  userMiddleware.getMeInQuery,
  contractController.getMyContract
);

/**
 * Employee Updates the contract if client requested changes
 */
router.patch(
  '/update/:id',
  authMiddleware.routeGuard('employee'),
  contractController.updateMyContract
);

// Clients only routes
router.patch(
  '/accept/:id',
  authMiddleware.routeGuard('client'),
  contractController.acceptContract
);

router.use(authMiddleware.checkLoggedAdmin);

//////////////// Admin routes ////////////////

router.get('/', contractController.getAllContracts);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .patch(contractController.updateContract)
  .delete(contractController.deleteContract);

module.exports = router;
