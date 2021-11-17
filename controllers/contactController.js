// Utils
const factory = require('../utils/factory');

// Models
const Contact = require('../models/contactModel');

/**
 * Create a single Contact
 */
exports.createContact = factory.createOne(Contact);

/**
 * Update a single Contact
 */
exports.updateContact = factory.updateOne(Contact);

/**
 * Get a single Contact
 */
exports.getContact = factory.getOne(Contact);

/**
 * Get all categories
 */
exports.getAllContacts = factory.getAll(Contact, {
  searchFields: ['subject', 'message', 'name', 'email', 'message'],
});

/**
 * Delete a single Contact
 */
exports.deleteContact = factory.deleteOne(Contact);
