'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');

const CatalogInfo = require('./catalogInfo');

const catalogInfo = new CatalogInfo();

const FileInfo = require('./fileInfo');

const fileInfo = new FileInfo();

const PathInfo = require('../storage/pathInfo');

const pathInfo = new PathInfo();

const fieldMap = require('./fieldMap');

const service = {};

service.getMapPath = function getMapPath(fromWhere, cb) {
  pathInfo.collection.findOne({ _id: fromWhere }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    let mapPath = doc ? doc.streamingPath : '';
    if (mapPath) {
      mapPath = mapPath.replace(/\//g, '');
      mapPath = `/${mapPath}`;
    }
    return cb && cb(null, mapPath);
  });
};

service.getCatalogInfo = function getCatalogInfo(query, cb) {
  const catalogId = query.catalogId || '';
  const newQuery = {};
  newQuery.$or = [{ _id: catalogId }, { objectId: catalogId, root: '' }];
  catalogInfo.collection.findOne(newQuery, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }
    delete query.catalogId;
    query.objectId = doc.objectId;

    fileInfo.collection.findOne(query, (err, file) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!file) {
        return cb && cb(i18n.t('fileInfoNotFound'));
      }
      doc.fileInfo = file;
      return cb && cb(null, doc);
    });
  });
};

service.getFileInfo = function getFileInfo(query, cb) {
  const catalogId = query.catalogId || '';
  const newQuery = {};
  newQuery.$or = [{ _id: catalogId }, { objectId: catalogId, root: '' }];
  catalogInfo.collection.findOne(newQuery, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }

    delete query.catalogId;
    query.objectId = doc.objectId;
    fileInfo.collection.findOne(query, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!doc) {
        return cb && cb(i18n.t('fileInfoNotFound'));
      }
      return cb && cb(null, doc);
    });
  });
};

service.getAsyncCatalogInfoList = function getAsyncCatalogInfoList(info, cb) {
  let lastModify = info.lastmodify || '';
  let pageSize = info.count || 1;
  const page = info.page || 1;

  pageSize *= 1;
  pageSize = pageSize > 100 ? 100 : pageSize;
  pageSize = pageSize < 1 ? 1 : pageSize;

  const formatTimeStrToDate = function formatTimeStrToDate(lastModify) {
    if (lastModify && lastModify.length === 14) {
      const years = lastModify.substr(0, 4);
      const months = lastModify.substr(4, 2);
      const days = lastModify.substr(6, 2);
      const hours = lastModify.substr(8, 2);
      const minutes = lastModify.substr(10, 2);
      const seconds = lastModify.substr(12, 2);
      const dateStr = `${years}-${months}-${days} ${hours}:${minutes}:${seconds}`;
      const now = new Date(dateStr);
      now.setHours(now.getHours() + 8);
      return now;
    }

    return null;
  };

  lastModify = formatTimeStrToDate(lastModify);
  const query = {};
  if (lastModify) {
    query.lastModifyTime = { $gte: lastModify };
  } else {
    return cb && cb(i18n.t('invalidLastModify'));
  }


  console.log(query);
  catalogInfo.pagination(query, page, pageSize, (err, result) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const docs = result.docs || [];
    const rs = [];
    for (let i = 0; i < docs.length; i++) {
      const item = {};
      let fullText = '';
      item.name = docs[i].chineseName;
      for (const key in fieldMap.catalogInfoMap) {
        item[fieldMap.catalogInfoMap[key]] = docs[i][key];
        if (typeof item[fieldMap.catalogInfoMap[key]] === 'string') {
          fullText += `${item[fieldMap.catalogInfoMap[key]]} `;
        }
      }

      item.duration = item.outpoint - item.inpoint;
      item.full_text = fullText;
      if (!item.news_data) {
        delete item.news_data;
      }
      if (!item.airdata) {
        delete item.airdata;
      }
      if (!item.publish_time) {
        delete item.publish_time;
      }
      rs.push(item);
    }

    return cb && cb(null, rs);
  });
};

service.getObject = function getObject(_id, cb) {
  const rs = {
    status: '0',
    result: {
      basic: {},
      detail: {
        program: {},
        sequence: {},
      },
      files: [],
    },
  };

  const formatFile = function formatFile(info, file) {
    let rsFile = {};
    rsFile.OBJECTID = file.objectId;
    rsFile.FILENAME = file.name || '';
    rsFile.SANAME = FileInfo.TYPE_MAP[file.type];
    rsFile.FILESIZE = file.size;
    rsFile.INPOINT = info.inpoint;
    rsFile.OUTPOINT = info.outpoint;
    rsFile = Object.assign({}, rsFile, file);
    return rsFile;
  };

  const query = {};
  query.$or = [{ _id }, { objectId: _id, root: '' }];
  catalogInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }

    const basic = {};
    const objectId = doc.objectId;
    basic.OBJECTID = objectId;
    basic.INPOINT = doc.inpoint;
    basic.OUTPOINT = doc.outpoint;
    basic.ROOTID = doc.root;

    rs.result.basic = basic;

    for (const key in fieldMap.translateFields) {
      if (doc[key]) {
        const item = {
          cn: fieldMap.translateFields[key].cn,
          value: doc[key],
        };
        rs.result.detail.program[key] = item;
      }
    }
    rs.result.detail.program.OBJECTID = rs.result.detail.program.objectId;
    delete rs.result.detail.program.objectId;

    fileInfo.collection.find({ objectId }).toArray((err, files) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!files || files.length === 0) {
        return cb && cb(null, rs);
      }

      for (let i = 0, len = files.length; i < len; i++) {
        const file = formatFile(doc, files[i]);
        rs.result.files.push(file);
      }

      return cb && cb(null, rs);
    });
  });
};

module.exports = service;
