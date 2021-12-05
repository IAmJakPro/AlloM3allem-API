// Utils
const asyncHandler = require('../utils/asyncHandler');

// Models
const Setting = require('../models/settingModel');
const AppError = require('../utils/appError');

module.exports = asyncHandler(async (req, res, next) => {
  const settings = await Setting.findOne().select('maintenance_mode');

  const { maintenance_mode } = settings;

  if (maintenance_mode) {
    return next(
      new AppError(
        'The website is under maintenance, please come back later!',
        503
      )
    );
  }

  next();
});
