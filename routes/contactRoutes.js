// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const contactController = require('../controllers/contactController');

const router = express.Router();

//////////////// Public routes ////////////////

router.post('/', contactController.createContact);

//////////////// Admin routes ////////////////
router.use(authMiddleware.checkLoggedAdmin);

router.route('/').get(contactController.getAllContacts);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/:id')
  .get(contactController.getContact)
  .patch(contactController.updateContact)
  .delete(contactController.deleteContact);

module.exports = router;
