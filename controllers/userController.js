// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const filterObj = require('../utils/filterObj');
const { uploadImage } = require('../utils/uploadHelper');
const Employee = require('../models/employeeModel');

// Models
const User = require('../models/userModel');

/**
 * Update my profile
 */
exports.updateProfile = asyncHandler(async (req, res, next) => {
  // 1) Create an error if user tries to update their password.
  if (req.body.password) {
    return next(
      new AppError(
        'This route is not for password updates! Please use the /updatePassword route!',
        400
      )
    );
  }

  // 2) If not, simply update the User document.
  // We'll only get the 'phone' and 'city'.
  // Filter out unwanted field names first, that are not allowed to be updated.
  const filteredAccountBody = filterObj(req.body, true, 'phone', 'city');

  // 3) Update the account.
  const updatedAccount = await User.findByIdAndUpdate(
    req.user._id,
    filteredAccountBody
  );

  if (req.user.type === 'employee') {
    const filteredProfileBody = filterObj(req.body, false, 'user', 'portfolio');

    // 4) Update employee profile.
    const updatedProfile = await Employee.findOneAndUpdate(
      { user: req.user._id },
      filteredProfileBody
    );
  }

  res.status(200).json({
    status: 'success',
    data: {},
  });
});

/**
 * Update my password
 */
exports.updatePassword = asyncHandler(async (req, res, next) => {
  const { password, currentPassword } = req.body;
  const user = await User.findById(req.user._id);
  if (
    !user ||
    !(await user.isPasswordCorrect(currentPassword, user.password))
  ) {
    return next(new AppError('Current password incorrect!', 401));
  }

  user.password = password;
  await user.save();

  res.status(200).json({
    status: 'success',
    data: user,
  });
});

/**
 * Upload user profile image
 */
exports.uploadUserImage = asyncHandler(async (req, res, next) => {
  const image = req.file;
  if (!image || image === undefined) {
    return next();
  }

  const imageUrl = await uploadImage(image, 'users', true);

  req.body.image = imageUrl;

  next();
});

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////

/**
 * Create a single user
 */
exports.createUser = factory.createOne(User, {}, async (user) => {
  await user.notify('welcome', {
    message: {
      fr: `Bienvenu ${user.name} sur AlloM3allem`,
      ar: `مرحبًا بك ${user.name} في الومعلم`,
    },
  });
});

/**
 * Update a single user
 */
exports.updateUser = factory.updateOne(User);

/**
 * Get a single user
 */
exports.getUser = factory.getOne(User, '', {
  toPopulate: ['employee', 'client'],
});

/**
 * Get all users
 */
exports.getAllUsers = factory.getAll(User, {
  searchFields: ['name', 'username', 'phone', 'city', 'type', 'status'],
  toPopulate: ['employee', 'client'],
});

/**
 * Delete a single user
 */
exports.deleteUser = factory.deleteOne(User);
