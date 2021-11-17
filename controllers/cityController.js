// Utils
const factory = require('../utils/factory');

// Models
const City = require('../models/cityModel');

/**
 * Get all cities
 */
exports.getAllCities = factory.getAll(City, {
  searchFields: ['name.fr', 'name.ar'],
  userFilters: { isActive: true },
});

//////////////////////////////////////////////
////////////// Only admins ///////////////////
//////////////////////////////////////////////
/**
 * Create a single city
 */
exports.createCity = factory.createOne(City);

/**
 * Update a single city
 */
exports.updateCity = factory.updateOne(City);

/**
 * Get a single city
 */
exports.getCity = factory.getOne(City);

/**
 * Delete a single city
 */
exports.deleteCity = factory.deleteOne(City);
