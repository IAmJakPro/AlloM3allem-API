// Utils
const factory = require('../utils/factory');
const asyncHandler = require('../utils/asyncHandler');
const { uploadImage, deleteImage } = require('../utils/uploadHelper');

// Models
const Service = require('../models/serviceModel');
const { default: slugify } = require('slugify');

/**
 * Create a single Service
 */
exports.createService = factory.createOne(Service);

/**
 * Update a single Service
 */
exports.updateService = factory.updateOne(Service);

/**
 * Get a single Service
 */
exports.getService = factory.getOne(Service);

/**
 * Get all cities
 */
exports.getAllServices = factory.getAll(Service, {
  searchFields: ['name.fr', 'name.ar'],
});

/**
 * Delete a single Service
 */
exports.deleteService = factory.deleteOne(Service, async (service) => {
  if (service.image) {
    const splited = service.image.split('/');
    await deleteImage(
      `${splited[splited.length - 2]}/${splited[splited.length - 1]}`
    );
  }
});

/**
 * Upload service image
 */
exports.uploadServiceImage = asyncHandler(async (req, res, next) => {
  const image = req.file;
  if (!image || image === undefined) {
    return next();
  }

  const imageUrl = await uploadImage(image, 'services');

  req.body.image = imageUrl;

  next();
});
