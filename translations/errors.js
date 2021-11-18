exports.ROUTE_NOT_FOUND = {
  // 404
  en: (originalUrl) => `Can't find ${originalUrl} on this server!`,
  fr: (originalUrl) => `${originalUrl} n'est pas trouvé sur ce serveur !`,
  ar: (originalUrl) => `غير موجود على هذا الخادم ${originalUrl}!`,
};

exports.AUTH_ERRORS = {
  USER_NOT_EXISTS: {
    // 404
    en: 'This user not exist!',
    fr: '',
    ar: '',
  },
  SEND_SMS_FAILED: {
    // 500
    en: 'There was an error sending sms. Try again later!',
    fr: '',
    ar: '',
  },
  RESET_TOKEN_FAILED: {
    // 500
    en: 'Reset token is invalid!',
    fr: '',
    ar: '',
  },
  INVALID_TOKEN: {
    // 400
    en: 'Token is invalid or has expired!',
    fr: '',
    ar: '',
  },

  PHONE_NUMBER_EXISTS: {
    // 401
    en: 'This phone number is already exists, please try a different phone number, or login!',
    fr: '',
    ar: '',
  },

  PROVIDE_PHONE_NUMBER_AND_PASS: {
    // 400
    en: 'Please provide a phone number and a password!',
    fr: '',
    ar: '',
  },

  INCORRECT_LOGINS: {
    // 401
    en: 'Incorrect phone number or password!',
    fr: '',
    ar: '',
  },

  ACCOUNT_NOT_ACTIVE: {
    // 401
    en: 'Your account is not active yet!',
    fr: '',
    ar: '',
  },

  ACCOUNT_NOT_ACTIVE: {
    // 401
    en: 'Your account is not active yet!',
    fr: '',
    ar: '',
  },
};

exports.CONTRACT_ERRORS = {
  NOT_FOUND_OR_NO_PERMISSION: {
    // 404
    en: "Couldn't find a contract, or you don't have permission!",
    fr: '',
    ar: '',
  },
};

exports.EMPLOYEE_ERRORS = {
  NOT_FOUND_OR_NOT_ACTIVE: {
    // 404
    en: 'User with given username not found or not active!',
    fr: '',
    ar: '',
  },

  PORTFOLIO_IMAGE_IMAGE_REQUIRED: {
    // 500
    en: 'Please add at least one image!',
    fr: '',
    ar: '',
  },

  EMPLOYEE_NOT_FOUND: {
    // 404
    en: "We couldn't find this employee!",
    fr: '',
    ar: '',
  },

  PORTFOLIO_NOT_FOUND: {
    // 404
    en: "We couldn't find this portfolio!",
    fr: '',
    ar: '',
  },
};

exports.USER_ERRORS = {
  ROUTE_NOT_FOR_UPDATE_PASS: {
    // 400
    en: 'This route is not for password updates! Please use the /update-password route!',
    fr: '',
    ar: '',
  },

  CURRENT_PASSWORD_INCORRECT: {
    // 401
    en: 'Current password incorrect!',
    fr: '',
    ar: '',
  },
};
