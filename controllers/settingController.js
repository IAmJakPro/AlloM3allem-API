// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage } = require('../utils/uploadHelper');

// Models
const Setting = require('../models/settingModel');

//////////////////////////////////////////////
////////////// Only admins (of course) ///////////////////
//////////////////////////////////////////////

/**
 * Get settings
 */
exports.getSettings = asyncHandler(async (req, res, next) => {
  const settings = await Setting.findOne();
  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

/**
 * Update a single Setting
 */
exports.updateSettings = asyncHandler(async (req, res, next) => {
  const settings = await Setting.findOneAndUpdate({}, req.body);
  res.status(200).json({
    status: 'success',
    data: settings,
  });
});

/**
 * Upload logo and icon
 */
exports.upload = asyncHandler(async (req, res, next) => {
  const images = req.files;
  if (!images || images === undefined) {
    return next();
  }

  console.log('Images: ', images);

  for (const image in images) {
    const img = images[image][0];
    console.log('Single img: ', img);
    const imageUrl = await uploadImage(img, 'settings');
    if (img.fieldname === 'logo') {
      req.body.logo = imageUrl;
    }

    if (img.fieldname === 'icon') {
      req.body.icon = imageUrl;
    }

    console.log(req.body.icon);
    console.log(req.body.logo);
  }

  next();
});

/**
 * Create settings
 * This shouldn't be called later, so It should be called only one time, before production
 */
exports.createSettings = factory.createOne(Setting);
