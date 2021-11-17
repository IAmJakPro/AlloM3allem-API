// Utils
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Models
const Admin = require('../models/adminModel');

// Controllers
const authController = require('./authController');

/**
 * This function is used to handle admin when he/she is logging in.
 *
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @param {next} next - Express's next function
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { email, password } = req.body;

  // 1) Check if email and password exist.
  if (!email || !password) {
    return next(new AppError('Please provide a email and a password!', 400));
  }

  // 2) Check if admin exists and the credentials are correct.
  const admin = await Admin.findOne({ email: email }).select('+password');

  if (!admin || !(await admin.isPasswordCorrect(password, admin.password))) {
    return next(new AppError('Incorrect email or password!', 401));
  }

  // 3) Check if the admin is active.
  if (!admin.isActive) {
    return next(
      new AppError(
        'Your account is not activated yet! Please check your email!',
        401
      )
    );
  }

  // 4) If it is true, send token back to client.
  authController.createAndSendToken('jwtAdmin', admin, 200, req, res);
});

/**
 * This function is used to handle a admin's logging out.
 *
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @param {next} next - Express's next function
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('jwtAdmin', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});
