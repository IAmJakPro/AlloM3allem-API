// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

// Controllers
const employeeController = require('../controllers/employeeController');

const router = express.Router();

//////////////// Public routes ////////////////

router.get('/', employeeController.getAllEmployees);

router.get('/username/:username', employeeController.getEmployeeByUsername);

//////////////// User routes ////////////////
router.use(authMiddleware.checkLoggedUser);

router.get('/:id/phone', employeeController.showPhoneNumber);

// Employees only routes
router.use(authMiddleware.routeGuard('employee'));

router.patch(
  '/portfolio',
  fileUploadMiddleware.array('images'),
  employeeController.uploadPortfolioImages,
  employeeController.createPortfolio
);
router
  .route('/portfolio/:id')
  .patch(
    fileUploadMiddleware.array('images'),
    employeeController.uploadPortfolioImages,
    employeeController.updatePortfolio
  )
  .delete(employeeController.deletePortfolio);

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee);

module.exports = router;
