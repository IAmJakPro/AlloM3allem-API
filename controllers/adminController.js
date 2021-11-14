// Utils
const factory = require('../utils/factory');

// Models
const Admin = require('../models/adminModel');

/**
 * Create a single admin
 */
exports.createAdmin = factory.createOne(Admin);

/**
 * Update a single admin
 */
exports.updateAdmin = factory.updateOne(Admin);

/**
 * Get a single admin
 */
exports.getAdmin = factory.getOne(Admin);

/**
 * Get all admins
 */
exports.getAllAdmins = factory.getAll(Admin, {
  searchFields: ['name', 'email'],
});

/**
 * Delete a single admin
 */
exports.deleteAdmin = factory.deleteOne(Admin);
