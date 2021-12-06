// Third-party libraries
var geoip = require('geoip-lite');
const requestIp = require('request-ip');

// Utils
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');

// Models
const User = require('../models/userModel');

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

  await newUser.notify('welcome', {
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

var getIpInfo = function (ip) {
  // IPV6 addresses can include IPV4 addresses
  // So req.ip can be '::ffff:86.3.182.58'
  // However geoip-lite returns null for these
  if (ip.includes('::ffff:')) {
    ip = ip.split(':').reverse()[0];
  }
  var lookedUpIP = geoip.lookup(ip);
  if (ip === '127.0.0.1' || ip === '::1') {
    return { error: "This won't work on localhost" };
  }
  if (!lookedUpIP) {
    return { error: 'Error occured while trying to process the information' };
  }
  return lookedUpIP;
};

var getIp = function (req) {
  var xForwardedFor = (req.headers['x-forwarded-for'] || '').replace(
    /:\d+$/,
    ''
  );
  var ip = xForwardedFor || req.connection.remoteAddress;
  console.group('IP: ', ip);
  return { ip, ...getIpInfo(ip) };
};

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

  console.log('This is inside login: ', getIp(req));
  console.log('ClientIP in auth: ', req.clientIp);

  function getipAddress(req) {
    return (
      req.ip ||
      req._remoteAddress ||
      (req.connection && req.connection.remoteAddress) ||
      undefined
    );
  }

  console.log('This is how it is: ', getipAddress(req));

  // 4) Update user last login date
  await user.update({ lastLogInAt: new Date(Date.now() + 1000) });

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
