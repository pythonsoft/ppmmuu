'use strict';

const service = {};
const TemplateInfo = require('./templateInfo');
const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const FastEditTemplateInfo = require('../shelfManage/fastEditTemplateInfo');
const ShelfTemplateInfo = require('../shelfManage/templateInfo');
const LibraryTemplateInfo = require('../library/templateInfo');

const fastEditTemplateInfo = new FastEditTemplateInfo();
const shelfTemplateInfo = new ShelfTemplateInfo();
const libraryTemplateInfo = new LibraryTemplateInfo();

const TYPE_CONFIG = {
  1: {
    model: fastEditTemplateInfo,
  },
  2: {
    model: libraryTemplateInfo,
  },
  3: {
    model: shelfTemplateInfo,
  },
};


service.getTemplateListByType = function getTemplateListByType(info, cb) {
  const type = info.type;
  if (!utils.isValueInObject(type, TemplateInfo.TYPE)) {
    return cb && cb(i18n.t('templateTypeIsInvalid'));
  }
  const model = TYPE_CONFIG[type].model;
  const page = 1;
  const pageSize = 999;

  model.pagination({}, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, docs);
  }, '-createdTime');
};

module.exports = service;
