'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');

const CatalogInfo = require('./catalogInfo');

const catalogInfo = new CatalogInfo();

const FileInfo = require('./fileInfo');

const fileInfo = new FileInfo();

const TemplateInfo = require('./templateInfo');

const templateInfo = new TemplateInfo();

const fieldMap = require('./fieldMap');

const service = {};

service.getMapPath = function getMapPath(fromWhere, cb) {
  templateInfo.collection.findOne({ fromWhere: fromWhere * 1 }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    let mapPath = doc ? doc.mapPath : '';
    if (mapPath) {
      mapPath = mapPath.replace(/\//g, '');
      mapPath = `/${mapPath}`;
    }
    return cb && cb(null, mapPath);
  });
};

service.getCatalogInfo = function getCatalogInfo(query, cb) {
  catalogInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }
    return cb && cb(null, doc);
  });
};

service.getFileInfo = function getFileInfo(query, cb) {
  fileInfo.collection.findOne(query, (err, doc) => {
    console.log(doc, query);
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('fileInfoNotFound'));
    }
    return cb && cb(null, doc);
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
  const query = { 'fileInfo.type': FileInfo.TYPE.LOW_BIT_VIDEO };
  if (lastModify) {
    query.lastModifyTime = { $gte: lastModify };
  } else {
    return cb && cb(i18n.t('invalidLastModify'));
  }


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
      if (item.materialDate.from) {
        item.materialDate.from = new Date('2017-03-25').toISOString();
      }
      if (item.materialDate.to) {
        item.materialDate.to = new Date('2017-09-25').toISOString();
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

service.getObject = function getObject(objectId, cb) {
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

  catalogInfo.collection.find({ objectId }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    docs = docs || [];

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('catalogInfoNotFound'));
    }

    const doc = docs[0];

    const basic = {};
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

    const fileIds = [];
    const docsObj = {};
    for (let i = 0, len = docs.length; i < len; i++) {
      if (docs[i].fileInfo && docs[i].fileInfo._id) {
        fileIds.push(docs[i].fileInfo._id);
        docsObj[docs[i].fileInfo._id] = docs[i];
      }
    }
    fileInfo.collection.find({ _id: { $in: fileIds } }).toArray((err, files) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!files || files.length === 0) {
        return cb && cb(null, rs);
      }

      for (let i = 0, len = files.length; i < len; i++) {
        const file = formatFile(docsObj[files[i]._id], files[i]);
        rs.result.files.push(file);
      }

      return cb && cb(null, rs);
    });
  });
};

module.exports = service;
