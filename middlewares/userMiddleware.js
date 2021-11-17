// NOTE: To use these middlewares the user should be logged in

/**
 * This function is used to get the user as param id.
 *
 * @param {err} err - Express's error object
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @return void
 */
exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

/**
 * This function is used to get the user id in the body as employee/client.
 *
 * @param {err} err - Express's error object
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @return void
 */
exports.getMeInBody = (req, res, next) => {
  const userId = req.user.id;
  if (req.user.type === 'employee') {
    req.body.employee = userId;
  }

  if (req.user.type === 'client') {
    req.body.client = userId;
  }

  next();
};

/**
 * This function is used to get the user id in the query as employee/client.
 *
 * @param {err} err - Express's error object
 * @param {req} req - Express's request object
 * @param {res} res - Express's response object
 * @return void
 */
exports.getMeInQuery = (req, res, next) => {
  const userId = req.user.id;
  if (!req.query) {
    req.query = {};
  }
  if (req.user.type === 'employee') {
    req.query['employee'] = userId;
  }

  if (req.user.type === 'client') {
    req.query['client'] = userId;
  }

  next();
};
