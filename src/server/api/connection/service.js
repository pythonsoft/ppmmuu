/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const AnchorInfo = require('./anchorInfo');

const anchorInfo = new AnchorInfo();

const ChannelInfo = require('./channelInfo');

const channelInfo = new ChannelInfo();

const service = {};

service.createAnchorInfo = function createAnchorInfo(info, cb) {
  const struct = {
    type: { type: 'string', validation: v => utils.isValueInObject(v, AnchorInfo.TYPE) },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  info.creator = info.user;
  const type = info.type || '';
  if (type === AnchorInfo.TYPE.mobileToPC) {
    info._id = info.user._id;
    info.photo = info.user.photo;
    info.userName = info.user.name;
    info.channelId = '';
  } else {
    const struct = {
      channelId: { type: 'string', validation: 'require' },
      _id: { type: 'string', validation: 'require' },
      name: { type: 'string', validation: 'require' },
    };
    const err = utils.validation(info, struct);
    if (err) {
      return cb && cb(err);
    }
    info.photo = info.photo;
    info.userName = info.name;
  }

  anchorInfo.collection.findOne({ _id: info._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      const updateInfo = {
        modifyTime: new Date(),
        status: AnchorInfo.STATUS.CONNECTING,
        userName: info.userName,
        photo: info.photo,
        channelId: info.channelId,
        type: info.type,
      };
      anchorInfo.updateOne({ _id: info._id }, updateInfo, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, info._id);
      });
    } else {
      anchorInfo.insertOne(info, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, info._id);
      });
    }
  });
};

service.getAnchorInfo = function getChannelInfo(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  anchorInfo.collection.findOne({ _id: info._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.createChannels = function createChannels(infos, cb) {
  channelInfo.insertMany(infos, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null);
  });
};

const checkChannelId = function checkChannelId(channelId, cb) {
  if (channelId) {
    channelInfo.collection.findOne({ _id: channelId }, (err, ch) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!ch) {
        return cb && cb(i18n.t('canNotFindChannel'));
      }
      return cb && cb(null);
    });
  } else {
    return cb && cb(null);
  }
};

service.assignChannel = function assignChannel(info, cb) {
  const struct = {
    status: { type: 'string', validation: v => utils.isValueInObject(v, AnchorInfo.STATUS) },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  const status = info.status || '';
  const userId = info.anchorId || info.dealUser._id;
  const channelId = info.channelId || '';
  const targetId = info.targetId || '';
  anchorInfo.collection.findOne({ _id: userId, status: AnchorInfo.STATUS.CONNECTING }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('canNotFindConnectingAnchor'));
    }

    checkChannelId(channelId, (err) => {
      if (err) {
        return cb && cb(err);
      }
      let updateInfo = {
        status,
      };
      if (status === AnchorInfo.STATUS.CONNECTED) {
        updateInfo = {
          status: AnchorInfo.STATUS.CONNECTED,
          targetId,
          dealUser: info.dealUser,
        };
        if (channelId) {
          updateInfo.channelId = channelId;
        }
      }
      anchorInfo.updateOne({ _id: userId }, updateInfo, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, 'ok');
      });
    });
  });
};

service.getAllChannel = function getAllChannel(cb) {
  channelInfo.collection.find({}).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs && docs.length) {
      return cb && cb(null, docs);
    }
    return cb && cb(null, []);
  });
};

service.getSummary = function getSummary(cb) {
  channelInfo.collection.find({}).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs && docs.length) {
      const loopGetCount = function loopGetCount(index) {
        if (index >= docs.length) {
          return cb && cb(null, docs);
        }
        const item = docs[index];
        const channelId = item._id;
        const queryStatus = [AnchorInfo.STATUS.CONNECTING, AnchorInfo.STATUS.CONNECTED];

        anchorInfo.collection.count({ channelId, status: { $in: queryStatus } }, (err, number) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }
          item.count = number;
          loopGetCount(index + 1);
        });
      };
      loopGetCount(0);
    } else {
      return cb && cb(null, []);
    }
  });
};

service.listAnchor = function listAnchor(info, cb) {
  const pageSize = info.pageSize || 15;
  const page = info.page || 1;
  let status = info.status || '';
  const type = info.type || '';
  const keyword = info.keyword || '';
  const channelId = info.channelId || '';
  const fieldsNeed = info.fieldsNeed || '';
  const sortFields = info.sortFields || '-modifyTime';
  const q = {};

  if (status) {
    status = status.split(',');
    q.status = { $in: status };
  }

  if (keyword) {
    q.userName = { $regex: keyword, $options: 'i' };
  }

  if (channelId) {
    q.channelId = channelId;
  }
  if (type) {
    q.type = type;
  }

  anchorInfo.pagination(q, page, pageSize, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, r);
  }, sortFields, fieldsNeed);
};


module.exports = service;
