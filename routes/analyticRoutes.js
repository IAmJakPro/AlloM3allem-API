// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const analyticController = require('../controllers/analyticController');

const router = express.Router();

router.use(authMiddleware.checkLoggedAdmin);

router.get('/', analyticController.getAnalytics)
router.get('/counts', analyticController.getCounts)

module.exports = router;
