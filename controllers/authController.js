// Third party libraries
const { promisify } = require('util');
const crypto = require('crypto');
const jwt = require('jsonwebtoken');

// Utils
const AppError = require('../utils/appError');
const asyncHandler = require('../utils/asyncHandler');
const { sms } = require('../utils/sms');

// Models
const User = require('../models/userModel');

/**
 * This function is used to sign the JWT to check whether the token is valid or not.
 *
 * @param {id} id - ID of the user.
 * @param {string} type - Type of the user (admin - user).
 * @param {string} role - Role of the user (client - employee - admin - super_admin).
 */
const signToken = (id, type, role) =>
  jwt.sign({ id, type, role }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN * 60 * 60 + 's',
  });

/**
 * This function is used to create and send token to user's cookie.
 *
 * @param {user} user - Currently logged in user
 * @param {statusCode} statusCode - Status code of the request
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 */
exports.createAndSendToken = (cookieKey, user, statusCode, req, res) => {
  const role = cookieKey === 'jwtUser' ? user.type : user.role;
  const token = signToken(user._id, cookieKey, role);
  const cookieOptions = {
    expires: new Date(
      Date.now() + process.env.JWT_COOKIE_EXPIRES_IN * 60 * 60 * 1000
    ),
    httpOnly: true,
    // Send a cookie to be secure if its on a production environment.
    // Check if the connection is secure, OR if the header contains HTTPS.
    secure: req.secure || req.headers['x-forwarded-proto'] === 'https',
  };

  // Send a cookie (back-end, must be assigned again in Next.js's proxy).
  res.cookie(cookieKey, token, cookieOptions);

  //let role;

  /* if (cookieKey === 'jwtAdmin') {
    role = user.role;
  } */

  // Remove passwords from output, then send response.
  user.password = undefined;
  res.status(statusCode).json({
    status: 'success',
    token,
    cookieKey,
    role,
    data: user.toClient(),
  });
};

///////////////////// Below routes just gotten from HAMZA, they're not tested yet ///////////////////////////

// send phone  verivication
exports.sendResetPassToken = asyncHandler(async (req, res, next) => {
  const { phone } = req.body;
  const user = await User.findOne({ phone });

  if (!user) return next(new AppError('This user not exist!', 404));

  const resetNumber = user.generateResetNumber();

  await user.save({ validateBeforeSave: false });

  try {
    const message = `This is your paswword reset verification number,  ${resetNumber}  will expire after 10min`;
    const ReciverNumber = user.phone.startsWith('0')
      ? `212${user.phone.slice(1)}`
      : user.phone;
    //   // send sms
    await sms(message, ReciverNumber);

    res.status(200).json({
      status: 'success',
      message: 'Token sent!',
    });
  } catch (err) {
    user.passwordResetToken = undefined;
    user.passwordResetExpires = undefined;
    await user.save({ validateBeforeSave: false });

    return next(
      new AppError('There was an error sending sms. Try again later!'),
      500
    );
  }
});

/**
 * Verify token pass
 */
exports.verifTokenRestPass = asyncHandler(async (req, res, next) => {
  const numberHashed = crypto
    .createHash('sha256')
    .update(req.body.number)
    .digest('hex');

  const user = await User.findOne({
    passwordResetToken: numberHashed,
    passwordResetTokenExpire: { $gt: Date.now() },
  });

  if (!user) {
    return next(new AppError('Validation failed!', 500));
  }
  // link to sumbit new password
  const resetToken = user.genResetTokenForLink();

  await user.save({ validateBeforeSave: false });

  const link = `${req.protocol}://${req.get(
    'host'
  )}/api/users/resetpassword/${resetToken}`;

  res.status(200).json({
    status: 'success',
    data: { link },
  });
});

// reset password

exports.resetPassword = asyncHandler(async (req, res, next) => {
  const hashedToken = crypto
    .createHash('sha256')
    .update(req.params.token)
    .digest('hex');

  const user = await User.findOne({
    linkResetToken: hashedToken,
    linkResetTokenExpire: { $gt: Date.now() },
  });

  // ila l9a user bhad mowasafat ghaykml ghay3tih yraje3 password
  if (!user) {
    return next(new AppError('Token is invalid or has expired!', 400));
  }
  user.password = req.body.password;
  user.linkResetToken = undefined;
  user.linkResetTokenExpire = undefined;
  await user.save();

  createAndSendToken('jwtUser', user, 300, req, res);
});
