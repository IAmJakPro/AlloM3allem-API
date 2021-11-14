// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

// Controllers
const employeeController = require('../controllers/employeeController');

const router = express.Router();

router.get('/', employeeController.getAllEmployees);

router.get('/username/:username', employeeController.getEmployeeByUsername);

router.use(authMiddleware.checkLoggedUser);

router.patch('/update-me', employeeController.updateMe);

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

router.use(authMiddleware.checkLoggedAdmin);

router
  .route('/:id')
  .get(employeeController.getEmployee)
  .patch(employeeController.updateEmployee);

module.exports = router;
