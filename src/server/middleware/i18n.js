let i18n = require('i18next');
let i18nMiddleware = require('i18next-express-middleware');
let i18nFsBackend = require('i18next-node-fs-backend');

i18n
.use(i18nMiddleware.LanguageDetector)
.use(i18nFsBackend)
.init({
  preload: ['en', 'zh'],
  fallbackLng: 'en',
  backend: {
    loadPath: '../../i18n/{{lng}}/{{ns}}.json',
  },
  ns: ['translation'],
  fallbackNS: 'translation',
  detection: {
    order: [/*'path', 'session', */'querystring', 'cookie', 'header'],
    lookupQuerystring: 'lng',
    lookupCookie: 'i18n',
    lookupPath: 'lng',
    lookupFromPathIndex: 0,
  },
});

module.exports = i18nMiddleware.handle(i18n, {
  ignoreRoutes: ['static/', 'public/'],
  removeLngFromUrl: false,
});
