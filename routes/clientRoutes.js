// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const clientController = require('../controllers/clientController');

const router = express.Router();

// Put routes here

module.exports = router;
