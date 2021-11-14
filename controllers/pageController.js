// Utils
const factory = require('../utils/factory');

// Models
const Page = require('../models/pageModel');

/**
 * Get all pages
 */
exports.getAllPages = factory.getAll(Page, { userFilters: { isActive: true } });

/**
 * Create page
 */
exports.createPage = factory.createOne(Page);

/**
 * Update page
 */
exports.updatePage = factory.updateOne(Page);

/**
 * Get a single page
 */
exports.getPage = factory.getOne(Page);

/**
 * Get page by slug
 */
exports.getPageBySlug = factory.getOne(Page, 'slug');

/**
 * Delete page
 */
exports.deletePage = factory.deleteOne(Page);