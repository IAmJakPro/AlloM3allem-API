// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');

// Models
const Notification = require('../models/notificationModel');

/**
 * Get my notifications
 */
exports.getMyNotifications = asyncHandler(async (req, res, next) => {
  const notifications = await Notification.find({ notifiable: req.user._id });
  res.status(200).json({
    status: 'success',
    data: notifications,
  });
});

/**
 * Read my notifications
 */
exports.readNotifications = asyncHandler(async (req, res, next) => {
  await Notification.updateMany(
    { notifiable: req.user.id, read_at: null },
    { $set: { read_at: new Date() } }
  );
  res.status(200).json({
    status: 'success',
    data: {},
  });
});

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////

/**
 * Create a single notification
 */
exports.createNotification = factory.createOne(Notification);

/**
 * Update a single notification
 */
exports.updateNotification = factory.updateOne(Notification);

/**
 * Get a single notification
 */
exports.getNotification = factory.getOne(Notification);

/**
 * Get all notifications
 */
exports.getAllNotifications = factory.getAll(Notification);

/**
 * Delete a single notification
 */
exports.deleteNotification = factory.deleteOne(Notification);
