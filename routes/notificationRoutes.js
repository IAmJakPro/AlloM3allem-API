// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Controllers
const notificationController = require('../controllers/notificationController');

const router = express.Router();

//////////////// User routes ////////////////

router.use(authMiddleware.checkLoggedUser);

router.get(
  '/my-notifications',

  /**
   * This is a simple middleware to get the logged in user as notifiable in query params,
   * so we can get only notifications of the logged in user
   */
  (req, res, next) => {
    if (!req.query) {
      req.query = {};
    }
    req.query['notifiable'] = req.user.id;
    next();
  },

  notificationController.getAllNotifications
);

router.patch('/read', notificationController.readNotifications);

//////////////// Admin routes ////////////////

router.use(authMiddleware.checkLoggedAdmin);

router.use(authMiddleware.routeGuard('super_admin', 'admin'));

/// Below routes will be used as needed, they're not used yet
router
  .route('/')
  .get(notificationController.getAllNotifications)
  .post(notificationController.createNotification);

router
  .route('/:id')
  .get(notificationController.getNotification)
  .patch(notificationController.updateNotification)
  .delete(notificationController.deleteNotification);

module.exports = router;
