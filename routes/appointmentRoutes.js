// Third party libraries
const express = require('express');

// Utils
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Controllers
const appointmentController = require('../controllers/appointmentController');

// Models
const User = require('../models/userModel');

const router = express.Router();

//////////////// Users routes ////////////////

router.use(authMiddleware.checkLoggedUser);

router.get(
  '/my-appointments',
  userMiddleware.getMeInQuery,
  appointmentController.myAppointments
);

// Client only routes
router.post(
  '/',
  authMiddleware.routeGuard('client'),
  userMiddleware.getMeInBody,
  appointmentController.createAppointment
);

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.get('/', appointmentController.getAllAppointments);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .patch(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

module.exports = router;
