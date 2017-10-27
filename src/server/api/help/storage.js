'use strict';

const multer = require('multer');
const config = require('./config');

const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, config.uploadPackagePath);
  },
  filename: function (req, file, cb) {
    cb(null, new Date().getTime() + '_' +file.originalname);
  },
});

const upload = multer({
  storage: storage,
  fileFilter: function (req, file, cb) {
    if(file.mimetype !== 'application/zip') {
      cb(null, false);
    }else {
      cb (null, true);
    }
  }
});

module.exports = { upload };
