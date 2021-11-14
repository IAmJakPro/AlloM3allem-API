/**
 * Note: Every function here naturally returns the asyncHandler and its insides.
 * Arrow function naturally returns everything if declared without curly brackets.
 */

// Utils
const AppError = require('./appError');
const asyncHandler = require('./asyncHandler');
const filterObj = require('./filterObj');

/**
 * This function is used to populate items
 * @param {Query} query - a db query
 * @param {Array} items - fields that should be populated
 * @returns Query
 */
const handlePopulates = (query, items) => {
  items.map((item) => {
    query.populate(item);
  });
  return query;
};

/**
 * This function is sed to get the language from request headers
 * @param {Object} headers - the request headers
 * @returns string
 */
const getLang = (headers) => {
  const acceptLang = headers['accept-language'];

  if (!acceptLang) return null;

  if (acceptLang.indexOf('fr') > -1) return 'fr';

  if (acceptLang.indexOf('ar') > -1) return 'ar';

  return null;
};

/**
 * This function is set the type of user (admin or user)
 * @param {Object} req - the request object
 * @returns boolean
 */
const isAdmin = (req) => {
  if (req.admin) {
    return true;
  }
  return false;
};

/**
 * This function is used to create a single document asynchronously.
 *
 * @param {Model} Model - A mongoose model
 * @return void
 */
exports.createOne = (
  Model,
  allowedFields = { toAllow: true, user: [] },
  callback
) =>
  asyncHandler(async (req, res, next) => {
    if (Object.keys(allowedFields).length < 1) {
      allowedFields = allowedFields = { toAllow: true, user: [] };
    }

    let filteredBody = req.body;
    if (
      !req.admin &&
      Array.isArray(allowedFields.user) &&
      allowedFields.user.length > 0
    ) {
      filteredBody = filterObj(
        req.body,
        allowedFields.toAllow,
        ...allowedFields.user
      );
    }
    const doc = await Model.create(filteredBody);

    if (callback) {
      await callback(doc);
    }

    res.status(201).json({
      status: 'success',
      data: doc.toClient(isAdmin(req), getLang(req.headers)),
    });
  });

const searchAndFilter = (req, searchText, searchFields) => {
  let query = {};
  if (searchFields.length > 0) {
    query = {
      $or: [],
    };

    searchFields.map((sf) => {
      const obj = {};
      obj[sf] = {
        $regex: searchText,
        $options: 'i',
      };
      query.$or.push(obj);
    });
  }

  const queries = req.query;

  for (const key in queries) {
    if (key == 'limit' || key == 'page' || key == 'search') continue;

    if (Array.isArray(queries[key]) && queries[key].length > 0) {
      queries[key].map((q) => query.$or.push({ key: q }));
      continue;
    }

    query[key] = queries[key];
  }

  return query;
};

/**
 * This function is used to get all documents in a model.
 *
 * @param {Model} Model - A mongoose model
 * @return void
 */
exports.getAll = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    // Extract data from options
    const {
      searchFields = [], // these fields for searching

      // Fields to populate
      toPopulate = [],

      userFilters = {},
    } = options;

    const { page = 1, search = '', limit = 100 } = req.query;

    let query = searchAndFilter(req, search, searchFields);

    if (!req.admin || req.admin === undefined) {
      for (const f in userFilters) {
        query[f] = userFilters[f];
      }
    }

    let count = 0;
    let docs;

    // Get the populated docs
    docs = await handlePopulates(
      Model.find(query)
        .skip((parseInt(page) - 1) * limit)
        .limit(limit * 1),
      toPopulate
    );

    // Count the docs
    count = await Model.find(query).countDocuments();

    res.status(200).json({
      status: 'success',
      data: docs.map((doc) => doc.toClient(isAdmin(req), getLang(req.headers))),
      pagination: {
        totalPages: Math.ceil(count / limit),
        totalRecords: count,
        currentPage: parseInt(page),
        perPage: limit,
      },
    });
  });

/**
 * This function is used to get one document in a model.
 *
 * @param {Model} Model - A mongoose model
 * @return void
 */
exports.getOne = (Model, findBy = '', options = {}) =>
  asyncHandler(async (req, res, next) => {
    // Extract data from options
    const {
      // Fields to populate
      toPopulate = [],
    } = options;

    const identifier = req.params.id;
    const findByObj = {};
    if (findBy) {
      findByObj[findBy] = identifier;
    }
    // Get the populated docs
    const doc = await handlePopulates(
      findBy ? Model.findOne(findByObj) : Model.findById(identifier),
      toPopulate
    );

    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc.toClient(isAdmin(req), getLang(req.headers)),
    });
  });

/**
 * This function is used to update a document in a model.
 *
 * @param {Model} Model - A mongoose model
 * @return void
 */
exports.updateOne = (
  Model,
  allowedFields = { toAllow: true, user: [] },
  callback
) =>
  asyncHandler(async (req, res, next) => {
    if (Object.keys(allowedFields).length < 1) {
      allowedFields = { toAllow: true, user: [] };
    }

    let filteredBody = req.body;
    if (
      !req.admin &&
      Array.isArray(allowedFields.user.length > 0) &&
      allowedFields.user.length > 0
    ) {
      filteredBody = filterObj(
        req.body,
        allowedFields.toAllow,
        allowedFields.user
      );
    }

    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    if (callback) {
      callback(doc);
    }

    res.status(200).json({
      status: 'success',
      data: doc.toClient(isAdmin(req), getLang(req.headers)),
    });
  });

/**
 * This function is used to delete a document in a model.
 *
 * @param {Model} Model - A mongoose model
 * @return void
 */
exports.deleteOne = (Model, callback) =>
  asyncHandler(async (req, res, next) => {
    const doc = await Model.findOneAndDelete({ _id: req.params.id });

    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    if (callback) {
      await callback(doc);
    }

    res.status(200).json({
      status: 'success',
      data: {},
    });
  });
