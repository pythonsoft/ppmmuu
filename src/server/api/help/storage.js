'use strict';

const multer = require('multer');
const config = require('./config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadPackagePath);
  },
  filename: function (req, file, cb) {
    cb(null, file.fieldname)
  }
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    
  }
});

module.exports = { upload };
