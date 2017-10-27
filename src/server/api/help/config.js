'use strict';

const path = require('path');
const globalConfig = require('../../config');
const fs = require('fs');

const config = {};

config.uploadPackagePath = path.join(globalConfig.uploadPath, '_uploadPackage_');
config.uploadPackageTempPath = path.join(globalConfig.uploadPath, '_uploadPackageTemp_');

fs.access(config.uploadPackagePath, err => {
  if(!err) {
    console.log('system upgrade path ready.');
    return false;
  }
  if(!fs.existsSync(config.uploadPackagePath)) {
    fs.mkdirSync(config.uploadPackagePath);
  }
});

fs.access(config.uploadPackageTempPath, err => {
  if(!err) {
    console.log('system upgrade temp path ready.');
    return false;
  }
  if(!fs.existsSync(config.uploadPackageTempPath)) {
    fs.mkdirSync(config.uploadPackageTempPath);
  }
});

module.exports = config;