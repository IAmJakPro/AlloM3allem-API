// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const analyticController = require('../controllers/analyticController');

const router = express.Router();

router.use(authMiddleware.checkLoggedAdmin);

router.get('/', analyticController.getAnalytics);
router.get('/counts', analyticController.getCounts);
router.get('/genders', analyticController.getGenders);
router.get('/searches', analyticController.getSearches);
router.get('/searches/cities', analyticController.getTopSearchedCities);
router.get('/searches/services', analyticController.getTopSearchedServices);

module.exports = router;
