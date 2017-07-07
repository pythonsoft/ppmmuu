'use strict';

const multer = require('multer');

const config = require('../config');

const upload = multer({ dest: config.uploadPath });

module.exports = { upload };
