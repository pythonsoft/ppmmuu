/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const vm = require('vm');

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const storageService = require('../storage/service');

const TemplateInfo = require('./templateInfo');

const templateInfo = new TemplateInfo();

const service = {};

service.list = function list(type, sortFields = '-createdTime', fieldsNeed, page, pageSize=20, cb) {
  const query = {  };

  if (type) {
    if(type.indexOf(',') !== -1) {
      query['type'] = { $in: type.split(',') };
    }else {
      query.type = type;
    }
  }

  templateInfo.pagination(query, page, pageSize, cb, sortFields, fieldsNeed);
};

service.createTemplate = function createTemplate(creatorId, id, name, type=TemplateInfo.TYPE.DOWNLOAD, description, details, cb) {
  if(!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  const info = { _id: id, creatorId, name, type, description, details };
  const t = new Date();

  info.createdTime = t;
  info.modifyTime = t;

  templateInfo.insertOne(info, (err, rs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, rs);
  });

  return false;
};

service.createDownloadTemplate = function createDownloadTemplate(creatorId, id, name, description, bucketId, script, cb) {
  if(!bucketId) {
    return cb && cb(i18n.t('templateStorageIdIsNotExist'));
  }

  const details = { bucketId, script };

  service.createTemplate(creatorId, id, name, TemplateInfo.TYPE.DOWNLOAD, description, details, cb);

  return false;
};

service.remove = function remove(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  templateInfo.collection.removeOne({ _id: id }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.update = function update(id, info, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  if (utils.isEmptyObject(info)) {
    return cb && cb(null, 'ok');
  }

  info.modifyTime = new Date();

  if(info._id) {
    delete info._id;
  }

  if(info.id) {
    delete info.id;
  }

  templateInfo.updateOne({ _id: id }, info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.getDetail = function getDetail(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  templateInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.getDownloadPath = function getDownloadPath(userInfo, id, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  service.getDetail(id, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if(!doc) {
      return cb && cb(i18n.t('templateIsNotExist'));
    }

    if(!doc.details.bucketId) {
      return cb && cb(i18n.t('templateBucketIdIsNotExist'));
    }

    storageService.getBucketDetail(doc.details.bucketId, (err, bucketInfo) => {
      if(err) {
        return cb && cb(err);
      }

      if(!bucketInfo) {
        return cb && cb(i18n.t('templateBucketIsNotExist'));
      }

      const user = Object.assign({}, userInfo);
      user.password = '';

      runDownloadScript(user, bucketInfo, doc.details.script, cb);

    });
  });

};

const checkPathId = function checkPathId(ids, docs) {
  let notExistIds = [];
  let docsMap = {};

  for(let j = 0, l = docs.length; j < l; j++) {
    docsMap[docs[j]._id] = docs[j];
  }

  for(let i = 0, len = ids.length; i < len; i++) {
    if(!docsMap[ids[i]]) {
      notExistIds.push(ids[i]);
    }
  }

  return notExistIds;
};

const fixed = function(str) {
  if(str.length !== 2) {
    str = '0' + str;
  }

  return str;
};

const runDownloadScript = function runDownloadScript(userInfo, bucketInfo, script, cb) {
  //const pathId =${ paths.pathId }
  let execScript = script.replace(/\s+/g, '').replace(/(\r\n|\n|\r)/gm, '');
  const paths = execScript.match(/\$\{paths.([0-9a-zA-Z]+)\}/g);
  const len = paths.length;
  const pathIds = [];
  let temp = '';

  for(let i = 0; i < len; i++) {
    temp = paths[i].match(/\.([0-9a-zA-Z]+)/);
    if(temp.length > 0) { pathIds.push(temp[1]) };
  }

  if(pathIds.length === 0) {
    return cb && cb(null, '');
  }

  storageService.getPaths(pathIds, (err, docs) => {
    if(err) {
      return cb && cb(err);
    }

    const notExistIds = checkPathId(pathIds, docs);

    if(notExistIds.length > 0) {
      return cb && cb(i18n.t('templatePathIsNotExist'), { paths: notExistIds.join(',') });
    }

    for(let i = 0; i < docs.length; i++) {
      let reg = new RegExp('${paths.'+ docs[i]._id +'}', 'img');
      execScript = execScript.replace(reg, docs[i]._id);
    };

    const t = new Date();
    const year = t.getFullYear();
    let month = fixed((t.getMonth() + 1) + '');
    let day = fixed(t.getDate() + '');

    const sandbox = {
      userInfo,
      bucketInfo,
      year,
      month,
      day,
      result: ''
    };

    for(let i = 0, l = docs.length; i < l; i++) {
      sandbox[docs[i]._id] = docs[i];
    }

    const s = new vm.Script(execScript);
    s.runInNewContext(context);

    return cb && cb(null, sandbox.result);
  });

  return false;
};

module.exports = service;
