'use strict';

const path = require('path');
const globalConfig = require('../../config');
const fs = require('fs');

const config = {};

config.uploadPackagePath = path.join(globalConfig.uploadPath, '_uploadPackage_');
config.uploadPackageTempPath = path.join(globalConfig.uploadPath, '_uploadPackageTemp_');

if(!fs.existsSync(config.uploadPackagePath)) {
  fs.mkdirSync(config.uploadPackagePath);
}

if(!fs.existsSync(config.uploadPackageTempPath)) {
  fs.mkdirSync(config.uploadPackageTempPath);
}

module.exports = config;
