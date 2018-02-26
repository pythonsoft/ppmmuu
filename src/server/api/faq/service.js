/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');

const FaqInfo = require('./faqInfo');

const faqInfo = new FaqInfo();

const service = {};

service.getDetail = function getDetail(query, cb) {
  faqInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('faqInfoIsNotExist'));
    }

    return cb && cb(null, doc);
  });
};

service.createFaqInfo = function createFaqInfo(info, cb) {
  faqInfo.insertOne(info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.listFaqInfo = function listFaqInfo(info, cb) {
  const q = {};
  const keyword = info.keyword || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 15;


  if (keyword) {
    q.content = { $regex: keyword, $options: 'i' };
  }

  faqInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

module.exports = service;
