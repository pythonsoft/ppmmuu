'use strict';

const logger = require('../../common/log')('error');
const path = require('path');
const config = require('../../config');
const apn = require('apn');
const i18n = require('i18next');
const utils = require('../../common/utils');
const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const APPLE_PEM_BASE_PATH = path.join(config.pemPath, 'apple');

const service = {};

service.push = function (info, cb) {
  const struct = {
    userId: { type: 'string', validation: 'require' },
    alert: { type: 'string', validation: 'require' },
    cmd: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  userInfo.collection.findOne({ _id: info.userId }, { fields: { apnToken: 1, name: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }
    const token = doc.apnToken || '';
    const tokens = token.split(',');
    const apnService = new apn.Provider({
      cert: path.join(APPLE_PEM_BASE_PATH, './cert.pem'),
      key: path.join(APPLE_PEM_BASE_PATH, './key.pem'),
      passphrase: 'phoenixtv',
      production: false,
    });
    const note = new apn.Notification({
      alert: info.alert,
      sound: 'default',
      payload: {
        cmd: info.cmd,
        userName: doc.name,
      },
    });
    note.topic = '';
    note.badge = 1;
    apnService.send(note, tokens)
        .then(() => {
          apnService.shutdown();
          return cb && cb(null, 'ok');
        })
        .catch((error) => {
          apnService.shutdown();
          return cb && cb(i18n.t('apnPushError', { error }));
        });
  });
};

service.saveApnToken = function (info, cb) {
  const struct = {
    apnToken: { type: 'string', validation: 'require' },
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  const updateInfo = {
    apnToken: info.apnToken,
  };
  userInfo.updateOne({ _id: info._id }, updateInfo, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, 'ok');
  });
};

module.exports = service;
