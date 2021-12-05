/**
 * Note: Every function here naturally returns the asyncHandler and its insides.
 * Arrow function naturally returns everything if declared without curly brackets.
 */

// Third party libraries
const jwt = require('jsonwebtoken');

// Utils
const AppError = require('./appError');
const asyncHandler = require('./asyncHandler');
const filterObj = require('./filterObj');

// Models
const Admin = require('../models/adminModel');

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
const checkIsAdminLoggedIn = async (req) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith('Bearer')
  ) {
    token = req.headers.authorization.split(' ')[1];
  } else {
    return false;
  }

  const verifiedToken = jwt.verify(
    token,
    process.env.JWT_SECRET,
    (err, decoded) => {
      return decoded;
    }
  );

  if (!verifiedToken || verifiedToken.type !== 'jwtAdmin') {
    return false;
  }

  const loggedAdmin = await Admin.findById(verifiedToken.id);

  if (loggedAdmin) {
    return true;
  }

  return false;
};

/**
 * This function is used to create a single document asynchronously.
 *
 * @param {Model*} Model - Required: A mongoose model
 * @param {Object} allowedFields - the fields that should be allowed / disallowed for user to create (ONLY USERS, NOT ADMINS)
 * @param {Function} callback - the callback function that should be called when the item is created
 * @return void
 */
exports.createOne = (
  Model,
  allowedFields = { toAllow: true, user: [] },
  callback
) =>
  asyncHandler(async (req, res, next) => {
    // 1) If allowed fields not setted, set default values
    if (Object.keys(allowedFields).length < 1) {
      allowedFields = allowedFields = { toAllow: true, user: [] };
    }

    let filteredBody = req.body;
    const isAdmin = await checkIsAdminLoggedIn(req);

    // 2) Filter the object with allowedFields if the user is not admin
    if (
      !isAdmin &&
      Array.isArray(allowedFields.user) &&
      allowedFields.user.length > 0
    ) {
      filteredBody = filterObj(
        req.body,
        allowedFields.toAllow,
        ...allowedFields.user
      );
    }

    // 4) Create the model
    const doc = await Model.create(filteredBody);

    // 5) Call the callback method if setted
    if (callback) {
      await callback(doc);
    }

    // 6) return response
    res.status(201).json({
      status: 'success',
      data: doc.toClient(isAdmin, getLang(req.headers)),
    });
  });

/**
 * This method is for searching and filtering a model
 * @param {Request*} req
 * @param {String*} searchText
 * @param {Array*} searchFields
 * @returns auery object
 */
const searchAndFilter = (req, searchText, searchFields) => {
  // 1) Set the $or to the query, so we can filter fields
  let query = {};
  if (searchFields.length > 0) {
    query = {
      $or: [],
    };

    // 2) Map search fields and set them in the query object with thes earched text
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

  // 3) Now, we can filter with the queries params
  for (const key in queries) {
    if (key == 'limit' || key == 'page' || key == 'search') continue;

    if (Array.isArray(queries[key]) && queries[key].length > 0) {
      queries[key].map((q) => query.$or.push({ key: q }));
      continue;
    }

    query[key] = queries[key];
  }

  // return the filtering query object
  return query;
};

/**
 * This function is used to get all documents in a model.
 * @param {Model} Model - A mongoose model
 * @param {Object} Model - Options object that contains: (searchFields - toPopulate - userFilters)
 * @return void
 */
exports.getAll = (Model, options = {}) =>
  asyncHandler(async (req, res, next) => {
    // 1) Extract data from options
    const {
      searchFields = [], // these fields for searching

      // Fields to populate
      toPopulate = [],

      userFilters = {}, // Filters for users Only
    } = options;

    // 2) Get pagination params from query
    const { page = 1, search = '', limit = 100 } = req.query;

    // 3) Search and filter
    let query = searchAndFilter(req, search, searchFields);

    const isAdmin = await checkIsAdminLoggedIn(req);
    // 4) Use userFilters if the user is not admin
    if (!isAdmin) {
      for (const f in userFilters) {
        query[f] = userFilters[f];
      }
    }

    let count = 0;
    let docs;

    // 5) Get the populated docs
    docs = await handlePopulates(
      Model.find(query)
        .sort({ createdAt: 'desc' })
        .skip((parseInt(page) - 1) * limit)
        .limit(limit * 1),
      toPopulate
    );

    // 6) Count the docs
    count = await Model.find(query).countDocuments();

    // 7) Return response
    res.status(200).json({
      status: 'success',
      data: docs.map((doc) => doc.toClient(isAdmin, getLang(req.headers))),
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
 * @param {Model} Model - A mongoose model
 * @param {String} findBy - Find by username, name....,or id
 * @param {Object} options - Obtions (toPopulate - userFilters)
 * userFilters is used to filter the document before returning it
 * Most of times it will be a check if the doc's status is active
 * @return void
 */
exports.getOne = (Model, findBy = '', options = {}) =>
  asyncHandler(async (req, res, next) => {
    //1) Extract data from options
    const {
      // Fields to populate
      toPopulate = [],

      userFilters = {}, // Filters for users Only
    } = options;

    // 2) get the identifier if findBy is setted, otherwise keep it as default which is 'id'
    const identifier = req.params.id;
    const findByObj = {};
    if (findBy) {
      findByObj[findBy] = identifier;
    }

    // 3) Check if admin is logged in to see if we will use userFilters or not
    const isAdmin = await checkIsAdminLoggedIn(req);
    // Use userFilters if the user is not admin
    if (!isAdmin) {
      for (const f in userFilters) {
        findByObj[f] = userFilters[f];
      }
    }

    // 4) Get the populated docs
    const doc = await handlePopulates(
      findByObj && Object.keys(findByObj).length > 0
        ? Model.findOne(findByObj)
        : Model.findById(identifier),
      toPopulate
    );

    // 5) Throw error if the doc is not found
    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    // 6) Return json response
    res.status(200).json({
      status: 'success',
      data: doc.toClient(isAdmin, getLang(req.headers)),
    });
  });

/**
 * This function is used to update a single document asynchronously.
 *
 * @param {Model*} Model - Required: A mongoose model
 * @param {Object} allowedFields - the fields that should be allowed / disallowed for user to update (ONLY USERS, NOT ADMINS)
 * @param {Function} callback - the callback function that should be called when the item is updated
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

    // 1) Filter reuest body if the admin is not logged in and if allowedFields is setted
    let filteredBody = req.body;
    const isAdmin = await checkIsAdminLoggedIn(req);
    if (
      !isAdmin &&
      Array.isArray(allowedFields.user.length > 0) &&
      allowedFields.user.length > 0
    ) {
      filteredBody = filterObj(
        req.body,
        allowedFields.toAllow,
        allowedFields.user
      );
    }

    // 2) Find and update the doc
    const doc = await Model.findByIdAndUpdate(req.params.id, filteredBody, {
      new: true,
      runValidators: true,
    });

    // 3) Throw error if document to update is not found
    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    // 4) Call the callback method if it's setted
    if (callback) {
      callback(doc);
    }

    // 5) Return the json reponse
    res.status(200).json({
      status: 'success',
      data: doc.toClient(isAdmin, getLang(req.headers)),
    });
  });

/**
 * This function is used to delete a document in a model.
 *
 * @param {Model} Model - A mongoose model
 * @param {Function} callback - A callback method to be applied on the deeted doc
 * @return void
 */
exports.deleteOne = (Model, callback) =>
  asyncHandler(async (req, res, next) => {
    // 1) Find the document to delete
    const doc = await Model.findOneAndDelete({ _id: req.params.id });

    // 2) Throw erro if the doc is not found
    if (!doc) {
      return next(new AppError('No documents found with that ID!', 404));
    }

    // 3) Call the callback function if it's setted
    if (callback) {
      await callback(doc);
    }

    // 4) Return the json response
    res.status(200).json({
      status: 'success',
      data: {},
    });
  });

/**
 *
 * @param {Model} Model - A mongoose model
 * @param {Object} aggregateOtions - Aggregation options to be added to default once
 * @param {Object} project - Project in aggregate is the format that you want to return the document with as an object
 * @returns
 */
exports.getAllAggregate = (Model, aggregateOtions, project) =>
  asyncHandler(async (req, res, next) => {
    // 1) Extract request queries
    const { page = 1, search = '', limit = 100 } = req.query;
    let aggregate_options = [];

    //set the options for pagination
    const options = {
      page,
      page,
      limit: limit,
      collation: { locale: 'en' },
      customLabels: {
        totalDocs: 'totalRecords',
        docs: 'data',
        meta: 'pagination',
        page: 'currentPage',
        limit: 'perPage',
      },
    };

    // 2) Search and filter request with received queries from request
    let match = searchAndFilter(req, search, []);

    // 3) Add match - aggregate options - project to aggregate_options variable
    aggregate_options.push({ $match: match });

    aggregate_options.push(...aggregateOtions);

    aggregate_options.push({ $project: project(getLang(req.headers)) });

    // 4) Set up the aggregation
    const myAggregate = Model.aggregate(aggregate_options);

    // 5) Paginate and execute aggregation
    const result = await Model.aggregatePaginate(myAggregate, options);

    // 6) Return the json response
    return res.status(200).json({ status: 'success', ...result });
  });

// We export these functions because we MIGHT need them outside the factory
exports.getHeaderLang = getLang;
exports.isAdmin = checkIsAdminLoggedIn;
exports.searchAndFilter = searchAndFilter;
