// Third-party libraries
var geoip = require('geoip-lite');
const requestIp = require('request-ip');

// Utils
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Models
const User = require('../models/userModel');
const Setting = require('../models/settingModel');

// Controllers
const authController = require('./authController');

/**
 * This function is used to handle user registration.
 *
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @param {next} next - Express's next function
 */
exports.signup = asyncHandler(async (req, res, next) => {
  const { name, phone, type, city, password } = req.body;
  const user = await User.findOne({ phone });
  if (user) {
    return next(
      new AppError(
        'This phone number is already exists, please try a different phone number, or login!',
        401
      )
    );
  }
  const newUser = await User.create({
    name,
    phone,
    password,
    type,
    city,
  });

  const settings = await Setting.findOne().select('logo');

  await newUser.notify('welcome', {
    image: settings.logo,
    message: {
      fr: `Bienvenu ${name} sur AlloM3allem`,
      ar: `مرحبًا بك ${name} في الومعلم`,
    },
  });

  res.status(200).json({
    status: 'success',
    data: newUser.toClient(),
  });
});

function getipAddress(req) {
  return (
    req.ip ||
    req._remoteAddress ||
    (req.connection && req.connection.remoteAddress) ||
    req.headers['x-forwarded-for'] ||
    undefined
  );
}

/**
 * This function is used to handle user when he/she is logging in.
 *
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @param {next} next - Express's next function
 */
exports.login = asyncHandler(async (req, res, next) => {
  const { phone, password } = req.body;

  // 1) Check if phone and password exist.
  if (!phone || !password) {
    return next(
      new AppError('Please provide a phone number and a password!', 400)
    );
  }

  // 2) Check if user exists and the credentials are correct.
  const user = await User.findOne({ phone: phone }).select('+password');

  if (!user || !(await user.isPasswordCorrect(password, user.password))) {
    return next(new AppError('Incorrect phone number or password!', 401));
  }

  // 3) Check if the user is active.
  if (user.status !== 'active' && user.status !== 'desactive') {
    return next(new AppError('Your account is not active yet!', 401));
  }

  console.log('This is how it is: ', getipAddress(req));
  const clientIp = requestIp.getClientIp(req);
  console.log('Client ip: ', clientIp);
  const ip = clientIp;
  const userIps = user.ips;
  if (!userIps.includes(ip)) {
    userIps.push(ip);
  }

  // 4) Update user last login date
  await user.update({ lastLogInAt: new Date(Date.now() + 1000), ips: userIps });

  // 5) If it is true, send token back to client.
  authController.createAndSendToken('jwtUser', user, 200, req, res);
});

/**
 * This function is used to handle a user's logging out.
 *
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @param {next} next - Express's next function
 */
exports.logout = asyncHandler(async (req, res, next) => {
  res.cookie('jwtUser', 'loggedOut', {
    expires: new Date(Date.now() + 10 * 1000),
    httpOnly: true,
  });

  res.status(200).json({
    status: 'success',
  });
});
