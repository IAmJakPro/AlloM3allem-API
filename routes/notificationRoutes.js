// Third party libraries
const express = require('express');

// Middlewares
const authMiddleware = require('../middlewares/authMiddleware');
const userMiddleware = require('../middlewares/userMiddleware');

// Controllers
const notificationController = require('../controllers/notificationController');

const router = express.Router();

router.use(authMiddleware.checkLoggedUser);

router.get(
  '/my-notifications',
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

// Routes below are restricted for admins
router.use(authMiddleware.checkLoggedAdmin);

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
