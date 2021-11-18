const getTranslated = (obj, lang, ...params) => {
  if (!lang || (lang !== 'fr' && lang !== 'ar' && lang !== 'en')) {
    lang = 'en';
  }

  const langVar = obj[lang];
  let translatedString;

  if (typeof langVar == 'function') {
    translatedString = langVar(...params);
  } else {
    translatedString = langVar;
  }
  return translatedString;
};

module.exports = getTranslated;
