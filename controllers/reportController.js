// Utils
const factory = require('../utils/factory');

// Models
const Report = require('../models/reportModel');

/**
 * Create a single Report
 */
exports.createReport = factory.createOne(Report, {
  toAllow: false,
  user: ['reviewed'],
});

/**
 * Update a single Report
 */
exports.updateReport = factory.updateOne(Report, {
  toAllow: false,
  user: ['reviewed'],
});

/**
 * Get a single Report
 */
exports.getReport = factory.getOne(Report);

/**
 * Get all Reports
 */
exports.getAllReports = factory.getAll(Report, {
  searchFields: ['description'],
});

/**
 * Delete a single Report
 */
exports.deleteReport = factory.deleteOne(Report);
