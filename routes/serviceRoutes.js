// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const fileUploadMiddleware = require('../middlewares/fileUploadMiddleware');

// Controllers
const serviceController = require('../controllers/serviceController');

const router = express.Router();

router.get('/', serviceController.getAllServices);

// Routes below are restricted for admins
router.use(authMiddleware.checkLoggedAdmin);

router.post(
  '/',
  fileUploadMiddleware.single('image'),
  serviceController.uploadServiceImage,
  serviceController.createService
);

router
  .route('/:id')
  .get(serviceController.getService)
  .patch(
    fileUploadMiddleware.single('image'),
    serviceController.uploadServiceImage,
    serviceController.updateService
  )
  .delete(serviceController.deleteService);

module.exports = router;
