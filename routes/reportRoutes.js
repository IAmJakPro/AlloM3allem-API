// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const reportController = require('../controllers/reportController');

const router = express.Router();

router.post('/', reportController.createReport);

router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(reportController.getAllReports);

router
  .route('/:id')
  .get(reportController.getReport)
  .patch(reportController.updateReport)
  .delete(reportController.deleteReport);

module.exports = router;
