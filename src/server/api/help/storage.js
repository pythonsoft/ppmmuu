'use strict';

const multer = require('multer');
const config = require('./config');

const storage = multer.diskStorage({
  destination(req, file, cb) {
    cb(null, config.uploadPackagePath);
  },
  filename(req, file, cb) {
    cb(null, file.fieldname);
  },
});

const upload = multer({
  storage,
  fileFilter(req, file, cb) {

  },
});

module.exports = { upload };
