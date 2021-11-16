// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const cityController = require('../controllers/cityController');

const router = express.Router();

router.get('/', cityController.getAllCities);

// Routes below are restricted for admins
router.use(authMiddleware.checkLoggedAdmin);

router.post('/', cityController.createCity);

router
  .route('/:id')
  .get(cityController.getCity)
  .patch(cityController.updateCity)
  .delete(cityController.deleteCity);

module.exports = router;
