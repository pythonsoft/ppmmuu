/**
 * Created by steven on 2017/9/6.
 */

'use strict';

const config = require('../../config');
const utils = require('../../common/utils');
const logger = require('../../common/log')('error');
const i18n = require('i18next');
const result = require('../../common/result');
const uuid = require('uuid');
const path = require('path');

const VersionInfo = require('./versionInfo');
const versionInfo = new VersionInfo();

const TEMP_UNZIP_PATH = path.join(config.uploadPath, 'updatePackage', 'temp');

const service = {};

const unzip = function unzip(filePath) {

};

service.upload = function (info, creatorId, creatorName, cb) {
  if(!info._id) {
    info._id = uuid.v1();
  }
  const t = new Date();
  info.createdTime = t;
  info.modifyTime = t;
  info.creator = { _id: creatorId, name: creatorName };

  versionInfo.updateOne(info, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    return cb && cb(null, rs);
  });
};

service.update = function (id, status, description, cb) {
  const updateInfo = {};
  if(status) {
    updateInfo.status = status;
  }

  if(description) {
    updateInfo.description = description;
  }

  if(utils.isEmptyObject(updateInfo)) {
    return cb && cb(null, 'ok');
  }

  versionInfo.updateOne({ _id: id }, updateInfo, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message}));
    }

    return cb && cb(null, rs);
  });
};

module.exports = service;
