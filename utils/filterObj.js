/**
 * This function is used to filter an object
 * @param {Object} obj - Object to filter
 * @param {Boolean} toAllow  - allowedFields should be allowed or not allowed
 * @param  {...any} allowedFields - allowed fields
 * @returns
 */
const filterObj = (obj, toAllow = true, ...allowedFields) => {
  if (allowedFields.length < 1) {
    return obj;
  }

  const newObject = {};

  // If the current field is one of the allowed fields?
  // Then, new object with the field name of the current field, should be equal.
  // Equal to what? Equal to whatever it is in the object, at the current field.
  if (toAllow == true) {
    Object.keys(obj).forEach((el) => {
      if (allowedFields.includes(el)) {
        newObject[el] = obj[el];
      }
    });
  } else {
    Object.keys(obj).forEach((el) => {
      if (!allowedFields.includes(el)) {
        newObject[el] = obj[el];
      }
    });
  }

  return newObject;
};

module.exports = filterObj;
