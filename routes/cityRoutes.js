// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const cityController = require('../controllers/cityController');

const router = express.Router();

//////////////// Public routes ////////////////

router.get('/', cityController.getAllCities);

//////////////// Admin routes ////////////////
router.use(authMiddleware.checkLoggedAdmin);
router.use(authMiddleware.routeGuard('super_admin', 'admin'));

router.post('/', cityController.createCity);

router
  .route('/:id')
  .get(cityController.getCity)
  .patch(cityController.updateCity)
  .delete(cityController.deleteCity);

module.exports = router;
