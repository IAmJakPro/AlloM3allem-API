// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const contactController = require('../controllers/contactController');

const router = express.Router();

router.post('/', contactController.createContact);

// Routes below are restricted for super admins
router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(contactController.getAllContacts);

router
  .route('/:id')
  .get(contactController.getContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;
