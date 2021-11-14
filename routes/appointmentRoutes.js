// Third party libraries
const express = require('express');

// Utils
const asyncHandler = require('../utils/asyncHandler');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Controllers
const appointmentController = require('../controllers/appointmentController');

const router = express.Router();

router.use(authMiddleware.checkLoggedUser);

// Retrieve appointments for both client and employee
router.get(
  '/my-appointments',
  userMiddleware.getMeInQuery,
  appointmentController.myAppointments
);

// Client creates an appointment
router.post(
  '/',
  authMiddleware.routeGuard('client'),
  userMiddleware.getMeInBody,
  appointmentController.createAppointment
);

router.use(authMiddleware.checkLoggedAdmin);

router.get('/', appointmentController.getAllAppointments);

router
  .route('/:id')
  .patch(appointmentController.updateAppointment)
  .delete(appointmentController.deleteAppointment);

module.exports = router;
