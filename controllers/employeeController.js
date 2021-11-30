/**
 * This array prototype is for removing item in array
 * It will be extracted later
 * @returns Array
 */
Array.prototype.remove = function () {
  var what,
    a = arguments,
    L = a.length,
    ax;
  while (L && this.length) {
    what = a[--L];
    while ((ax = this.indexOf(what)) !== -1) {
      this.splice(ax, 1);
    }
  }
  return this;
};

// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');
const AppError = require('../utils/appError');
const { uploadImage, deleteImage } = require('../utils/uploadHelper');
const filterObj = require('../utils/filterObj');

// Models
const Employee = require('../models/employeeModel');
const User = require('../models/userModel');

/**
 * Get a single employee by username
 */
exports.getEmployeeByUsername = asyncHandler(async (req, res, next) => {
  /* const employee = await Employee.findOne().populate({
    path: 'user',
    match: {
      username: req.params.username,
      type: 'employee',
      status: 'active',
    },
  }); */
  const user = await User.findOne({
    username: req.params.username,
    type: 'employee',
    status: 'active',
  }).populate('employee');

  //const user = employee.user;
  if (!user) {
    return next(
      new AppError('User with given username not found or not active!', 404)
    );
  }

  res.status(200).json({
    status: 'success',
    data: user.toClient(false, factory.getHeaderLang(req.headers)),
  });
});

/**
 * Get all employees
 * We are using aggregate here because we want to get only employees that it's related user'status is active
 * And the populate will not achieve what we want
 */
exports.getAllEmployees = factory.getAllAggregate(
  Employee,
  [
    {
      $lookup: {
        from: 'services',
        localField: 'service',
        foreignField: '_id',
        as: 'service',
      },
    },
    {
      $unwind: '$service',
    },

    {
      $lookup: {
        from: 'cities',
        localField: 'workIn',
        foreignField: '_id',
        as: 'workIn',
      },
    },

    { $sort: { 'user.createdAt': -1 } },
  ],
  (lang) => ({
    id: '$user._id',
    workIn: lang === 'fr' ? '$workIn.name.fr' : '$workIn.name.ar',
    name: '$user.name',
    city: lang === 'fr' ? '$user.city.name.fr' : '$user.city.name.ar',
    username: '$user.username',
    avgRating: '$user.avgRating',
    ratingQty: '$user.ratingQty',
    isAvailable: '$isAvailable',
    image: '$user.image',
    service: lang === 'fr' ? '$service.name.fr' : '$service.name.ar',
  })
);

/**
 * Upload portfolio images
 */
exports.uploadPortfolioImages = asyncHandler(async (req, res, next) => {
  const images = req.files;
  if (!images || images.length < 1) {
    if (!req.params.id) {
      return next(new AppError('Please add at least one image!', 500));
    }
  }

  const storedImages = [];
  for (const image of images) {
    const imageUrl = await uploadImage(image, 'portfolio');
    storedImages.push(imageUrl);
  }

  req.body.images = storedImages;

  next();
});

/**
 * Create a portfolio item
 */
exports.createPortfolio = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return next(new AppError("We couldn't find this employee!", 404));
  }

  const filteredBody = filterObj(
    req.body,
    true,
    'title',
    'description',
    'images'
  );

  employee.portfolio.push(filteredBody);
  await employee.save();

  res.status(200).json({
    status: 'success',
    data: employee.portfolio,
  });
});

/**
 * Update a portfolio item
 */
exports.updatePortfolio = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return next(new AppError("We couldn't find this employee!", 404));
  }

  const isPortfolioExists = employee.portfolio.findIndex(
    (p) => p._id == req.params.id
  );

  if (isPortfolioExists < 0) {
    return next(new AppError("We couldn't find this portfolio!", 404));
  }

  let removedImages = req.body.removed_images;

  if (!Array.isArray(removedImages)) {
    removedImages = [removedImages];
  }

  if (removedImages && removedImages.length > 0) {
    for (let gi of removedImages) {
      const splited = gi.split('/');
      await deleteImage(
        `${splited[splited.length - 2]}/${splited[splited.length - 1]}`
      );

      employee.portfolio.find((p) => p._id == req.params.id).images.remove(gi);
    }
  }

  const filteredBody = filterObj(
    req.body,
    true,
    'title',
    'description',
    'images'
  );

  employee.portfolio.push(filteredBody);
  await employee.save();

  res.status(200).json({
    status: 'success',
    data: employee.portfolio,
  });
});

/**
 * Delete a portfolio item
 */
exports.deletePortfolio = asyncHandler(async (req, res, next) => {
  const employee = await Employee.findOne({ user: req.user.id });
  if (!employee) {
    return next(new AppError("We couldn't find this employee!", 404));
  }

  const portfolioIndex = employee.portfolio.findIndex(
    (p) => p._id == req.params.id
  );

  if (portfolioIndex < 0) {
    return next(new AppError("We couldn't find this portfolio!", 404));
  }

  const portfolio = employee.portfolio.find((p) => p._id == req.params.id);

  for (let image of portfolio.images) {
    const splited = image.split('/');
    await deleteImage(
      `${splited[splited.length - 2]}/${splited[splited.length - 1]}`
    );
  }

  employee.portfolio.splice(portfolioIndex, 1);
  await employee.save();

  res.status(200).json({
    status: 'success',
    data: employee.portfolio,
  });
});

/**
 * Update me
 * This function is not used anymore
 * It may be removed
 */
exports.updateMe = asyncHandler(async (req, res, next) => {
  // Filter out unwanted field names first, that are not allowed to be updated.
  const filteredBody = filterObj(req.body, false, 'portfolio');

  // 3) Update the document.
  const updatedUser = await Employee.findOneAndUpdate(
    { user: req.user._id },
    filteredBody
  );

  res.status(200).json({
    status: 'success',
    data: updatedUser.toClient(false, factory.getHeaderLang(req.headers)),
  });
});

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////

/**
 * Update a single employee
 */
exports.updateEmployee = factory.updateOne(Employee);

/**
 * Get single employee
 */
exports.getEmployee = factory.getOne(Employee);

/**
 * Show the phone number of a user
 */
exports.showPhoneNumber = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.params.id).select('phone');
  if (!user) {
    return next(new AppError("We couldn't find this user!", 404));
  }

  res.status(200).json({
    status: 'success',
    data: user,
  });
});
