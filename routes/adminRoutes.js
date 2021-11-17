// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');

// Controllers
const adminAuthController = require('../controllers/adminAuthController');
const adminController = require('../controllers/adminController');

const router = express.Router();

// Authentication for admins -- ability to login
router.post('/login', adminAuthController.login);

//////////////// Logged In Admin Routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.get('/logout', adminAuthController.logout);

router.get('/', adminController.getAllAdmins);

// Super admins only routes
router.use(authMiddleware.routeGuard('super_admin'));

router.post('/', adminController.createAdmin);

router
  .route('/:id')
  .get(adminController.getAdmin)
  .patch(adminController.updateAdmin)
  .delete(adminController.deleteAdmin);

module.exports = router;
