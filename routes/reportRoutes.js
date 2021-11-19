// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const reportController = require('../controllers/reportController');

const router = express.Router();

//////////////// Public routes ////////////////

router.post('/', reportController.createReport);

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(reportController.getAllReports);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .get(reportController.getReport)
  .patch(reportController.updateReport)
  .delete(reportController.deleteReport);

module.exports = router;
