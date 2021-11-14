exports.getMe = (req, res, next) => {
  req.params.id = req.user.id;
  next();
};

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
