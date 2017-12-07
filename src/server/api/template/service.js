/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const vm = require('vm');

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const path = require('path');
const config = require('../../config');
const request = require('request');

const storageService = require('../storage/service');
const jobService = require('../job/extService');
const roleService = require('../role/service');

const TemplateInfo = require('./templateInfo');

const templateInfo = new TemplateInfo();

const service = {};

const TemplateGroupInfo = require('./templateGroupInfo');

const templateGroupInfo = new TemplateGroupInfo();

const insertGroup = function insertGroup(info, cb) {
  templateGroupInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r.insertedId);
  });
};

service.addGroup = function addGroup(info, cb) {
  if (info.parentId) {
    templateGroupInfo.collection.findOne({ _id: info.parentId }, { fields: { _id: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('parentEngineGroupInfoIsNull'));
      }

      insertGroup(info, cb);
    });
  } else {
    insertGroup(info, cb);
  }
};

service.getGroup = function getGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateGroupIdIsNull'));
  }

  templateGroupInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('templateGroupCannotFind'));
    }

    return cb && cb(null, doc);
  });
};

service.listGroup = function listGroup(parentId, page, pageSize, cb) {
  const q = {};

  if (parentId) {
    q.parentId = parentId;
  } else {
    q.parentId = '';
  }

  templateGroupInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const listArr = docs.docs;
    const rs = [];
    const getChildren = function getChildren(index) {
      if (index >= listArr.length) {
        docs.docs = rs;
        return cb && cb(null, docs);
      }

      const temp = listArr[index];
      templateGroupInfo.collection.find({ parentId: temp._id }, { fields: { _id: 1 } }).toArray((err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        temp.children = [];
        for (let j = 0, len = r.length; j < len; j++) {
          const temp1 = r[j];
          temp.children.push(temp1._id);
        }
        rs.push(temp);
        getChildren(index + 1);
      });
    };
    getChildren(0);
  });
};

service.listChildGroup = function listChildGroup(id, fields, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  const q = {};

  if (id.constructor === Array) {
    q.parentId = { $in: id };
  } else {
    q.parentId = id;
  }

  let cursor = templateGroupInfo.collection.find(q);

  if (fields) {
    cursor = cursor.project(utils.formatSortOrFieldsParams(fields));
  }

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.updateGroup = function updateGroup(id, updateDoc = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  if (!updateDoc.modifyTime) {
    updateDoc.modifyTime = new Date();
  }

  templateGroupInfo.updateOne({ _id: id }, updateDoc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.deleteGroup = function deleteGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  templateGroupInfo.collection.findOne({ _id: id }, { fields: { _id: 1, deleteDeny: 1, type: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('engineGroupInfoIsNull'));
    }

    if (doc.deleteDeny === TemplateGroupInfo.DELETE_DENY.YES) {
      return cb && cb(i18n.t('engineGroupDeleteDenyIsYes'));
    }

    templateGroupInfo.collection.removeOne({ _id: doc._id }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      templateGroupInfo.collection.update({ parentId: doc._id }, { $set: { parentId: '' } }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        templateInfo.collection.removeMany({ groupId: doc._id }, (err, r) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, r);
        });
      });
    });
  });
};

const checkPathId = function checkPathId(ids, docs) {
  const notExistIds = [];
  const docsMap = {};

  for (let j = 0, l = docs.length; j < l; j++) {
    docsMap[docs[j]._id] = docs[j];
  }

  for (let i = 0, len = ids.length; i < len; i++) {
    if (!docsMap[ids[i]]) {
      notExistIds.push(ids[i]);
    }
  }

  return notExistIds;
};

const fixed = function fixed(str) {
  if (str.length !== 2) {
    str = `0${str}`;
  }

  return str;
};

const exec = function exec(userInfo, bucketInfo, execScript, pathsInfo = []) {
  const t = new Date();
  const year = t.getFullYear();
  const month = fixed(`${t.getMonth() + 1}`);
  const day = fixed(`${t.getDate()}`);
  const paths = {};
  const sandbox = {
    userInfo,
    bucketInfo,
    year,
    month,
    day,
    paths,
    result: '',
  };

  for (let i = 0, l = pathsInfo.length; i < l; i++) {
    sandbox.paths[pathsInfo[i]._id] = pathsInfo[i];
  }

  const rs = { err: null, result: '' };

  try {
    const s = new vm.Script(execScript);
    s.runInNewContext(sandbox);

    if (!sandbox.result) {
      rs.err = i18n.t('templateDownloadPathError', { downloadPath: sandbox.result });
    } else {
      rs.result = sandbox.result;
    }

    return rs;
  } catch (e) {
    logger.error(e);
    return rs;
  }
};

const runDownloadScript = function runDownloadScript(userInfo, bucketInfo, script, cb) {
  // const pathId =${ paths.pathId }
  let execScript = script.replace(/(\r\n|\n|\r)/gm, '');
  const paths = execScript.match(/paths.([0-9a-zA-Z]+)/g) || [];
  const len = paths.length;
  const pathIds = [];
  let temp = '';

  for (let i = 0; i < len; i++) {
    temp = paths[i].match(/\.([0-9a-zA-Z]+)/);
    if (temp.length > 0) { pathIds.push(temp[1]); }
  }

  if (pathIds.length === 0) {
    const rs = exec(userInfo, bucketInfo, execScript);
    return cb && cb(rs.err, rs.result);
  }

  storageService.getPaths(pathIds, (err, docs) => {
    if (err) {
      return cb && cb(err);
    }

    const notExistIds = checkPathId(pathIds, docs);

    if (notExistIds.length > 0) {
      return cb && cb(i18n.t('templatePathIsNotExist'), { paths: notExistIds.join(',') });
    }

    for (let i = 0; i < docs.length; i++) {
      const reg = new RegExp(`\${paths.${docs[i]._id}}`, 'img');
      execScript = execScript.replace(reg, docs[i]._id);
    }

    const rs = exec(userInfo, bucketInfo, execScript, docs);

    return cb && cb(rs.err, rs.result);
  });

  return false;
};

service.list = function list(type, groupId, sortFields = '-createdTime', fieldsNeed, page, pageSize = 20, cb) {
  const query = { };

  if (type) {
    if (type.indexOf(',') !== -1) {
      query.type = { $in: type.split(',') };
    } else {
      query.type = type;
    }
  }

  if (groupId && groupId.constructor.name.toLowerCase() === 'string') {
    query.groupId = groupId;
  } else if (groupId && groupId.constructor.name.toLowerCase() === 'array') {
    query.groupId = { $in: groupId };
  }

  templateInfo.pagination(query, page, pageSize, cb, sortFields, fieldsNeed);
};

service.listByIds = function listByIds(ids, fieldsNeed, cb) {
  if (!ids) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  let arr = [];

  if (ids.indexOf(',') !== -1) {
    arr = ids.split(',');
  } else if (arr.constructor === Array) {
    arr = ids;
  }

  let cursor = templateInfo.collection.find({ _id: { $in: arr } });

  if (fieldsNeed) {
    cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
  }

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.listUsableTemplate = function listUsableTemplate(userInfo, pageSize, cb) {
  const q = {};
  q.$or = [
    { users: { $elemMatch: { _id: userInfo._id } } },
    { users: { $elemMatch: { _id: userInfo.department._id } } },
    { users: { $elemMatch: { _id: userInfo.company._id } } },
  ];
  templateGroupInfo.collection.find(q, { fields: { _id: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('noDownloadPath'));
    }

    const groupIds = [];
    for (let i = 0, len = docs.length; i < len; i++) {
      groupIds.push(docs[i]._id);
    }

    service.list('', groupIds, null, null, 1, pageSize, (err, docs) => cb && cb(err, docs));
  });
};

service.createTemplate = function createTemplate(params, cb) {
  const info = utils.merge({
    id: '',
    creatorId: '',
    name: '',
    type: TemplateInfo.TYPE.DOWNLOAD,
    subtitleType: [],
    description: '',
    groupId: '',
    groupName: '',
    downloadAudit: '',
    transcodeTemplateDetail: {
      transcodeTemplates: [],
      transcodeTemplateSelector: '',
    },
    details: {},
  }, params);

  if (!info.id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  info._id = info.id;
  delete info.id;

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

/**
 *
 * @param transcodeTemplates [{ _id: '', name: '' }, ...]
 * @returns {*}
 */
function composeTranscodeTemplates(transcodeTemplates) {
  try {
    let ts = null;

    if (transcodeTemplates) {
      ts = JSON.parse(transcodeTemplates);

      if (ts.constructor !== Array) {
        return { status: '1', result: i18n.t('templateTranscodeTemplatesInvalidJSON') };
      }

      for (let i = 0, len = transcodeTemplates.length; i < len; i++) {
        if (transcodeTemplates[i]._id && transcodeTemplates[i].name) {
          ts.push(utils.merge({ _id: '', name: '' }, transcodeTemplates[i]));
        }
      }

      return { status: '0', result: ts };
    }

    return { status: '0', result: ts };
  } catch (e) {
    return { status: '0', result: i18n.t('templateTranscodeTemplatesInvalidJSON') };
  }
}

service.composeTranscodeTemplates = composeTranscodeTemplates;

service.createDownloadTemplate = function createDownloadTemplate(params, cb) {
  const info = utils.merge({
    creatorId: '',
    id: '',
    name: '',
    description: '',
    type: TemplateInfo.TYPE.DOWNLOAD,
    subtitleType: [],
    bucketId: '',
    script: '',
    groupId: '',
    downloadAudit: '',
    groupName: '',
    transcodeTemplates: '',
    transcodeTemplateSelector: '',
  }, params);

  if (!info.bucketId) {
    return cb && cb(i18n.t('templateStorageIdIsNotExist'));
  }

  if (!info.type) {
    info.type = TemplateInfo.TYPE.DOWNLOAD;
  }

  info.downloadAudit = !!info.downloadAudit;

  if (!utils.isValueInObject(info.type, TemplateInfo.TYPE)) {
    return cb && cb(i18n.t('templateTypeNotExist', { type: info.type }));
  }

  const rs = composeTranscodeTemplates(info.transcodeTemplates);

  if (rs.status !== '0') {
    return cb && cb(rs.result);
  } else if (rs.result) {
    info.transcodeTemplateDetail = {
      transcodeTemplates: rs.result,
      transcodeTemplateSelector: info.transcodeTemplateSelector,
    };
  }

  info.details = { bucketId: info.bucketId, script: info.script };

  service.createTemplate(info, cb);

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

  if (info._id) {
    delete info._id;
  }

  if (info.id) {
    delete info.id;
  }

  if (!info.type || info.type === TemplateInfo.TYPE.DOWNLOAD || info.type === TemplateInfo.TYPE.DOWNLOAD_MEDIAEXPRESS) {
    info.type = info.type ? info.type : TemplateInfo.TYPE.DOWNLOAD;

    info.details = templateInfo.createDownloadInfo(info.script, info.bucketId);

    if (info.transcodeTemplates) {
      const rs = composeTranscodeTemplates(info.transcodeTemplates);

      if (rs.status !== '0') {
        return cb && cb(rs.result);
      } else if (rs.result) {
        info.transcodeTemplateDetail = { transcodeTemplates: rs.result, transcodeTemplateSelector: info.transcodeTemplateSelector || '' };
      }
    }
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

    if (!doc) {
      return cb && cb(i18n.t('templateIsNotExist'));
    }

    if (!doc.details.bucketId) {
      return cb && cb(i18n.t('templateBucketIdIsNotExist'));
    }

    storageService.getBucketDetail(doc.details.bucketId, (err, bucketInfo) => {
      if (err) {
        return cb && cb(err);
      }

      if (!bucketInfo) {
        return cb && cb(i18n.t('templateBucketIsNotExist'));
      }

      const user = Object.assign({}, userInfo);
      user.password = '';

      runDownloadScript(user, bucketInfo, doc.details.script, (err, downloadPath) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, { downloadPath, bucketInfo, templateInfo: doc });
      });
    });
  });
};

function runTemplateSelector(info, code) {
  try {
    let sandbox = {
      result: '',
    };

    sandbox = Object.assign(sandbox, info);
    const script = new vm.Script(code.replace(/(\r\n|\n|\r)/gm, ''));
    script.runInNewContext(sandbox);
    return sandbox.result;
  } catch (e) {
    logger.error(e);
    return '';
  }
}

function getTranscode(fp, templatesInfo, downloadTemplateInfo) {
  const fileInfo = {};
  const name = fp || '*';

  if (fp) {
    fileInfo.ext = path.extname(fp);
    fileInfo.name = path.basename(fp).replace(fileInfo.ext, '');
  }

  const transcodeTemplate = runTemplateSelector({
    transcodeTemplates: templatesInfo,
    downloadTemplate: downloadTemplateInfo,
    fileInfo,
  }, downloadTemplateInfo.transcodeTemplateDetail.transcodeTemplateSelector);

  return { file: name, template: transcodeTemplate };
}

function filterTranscodeTemplates(doc = {}, filePath = '', cb, isResultReturnWithMap) {
  if (!doc.transcodeTemplateDetail || !doc.transcodeTemplateDetail.transcodeTemplateSelector) {
    return cb && cb(null, doc.transcodeTemplateDetail ? doc.transcodeTemplateDetail.transcodeTemplates : isResultReturnWithMap ? [] : '');
  }

  jobService.listTemplate({ page: 1, pageSize: 999 }, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }

    if (!rs) {
      return cb && cb(i18n.t('templateBucketIsNotExist'));
    }

    const transcodeTemplates = doc.transcodeTemplateDetail.transcodeTemplates;
    const info = { };

    for (let i = 0, len = transcodeTemplates.length; i < len; i++) {
      for (let j = 0, l = rs.data.docs.length; j < l; j++) {
        if (rs.data.docs[j].id === transcodeTemplates[i]._id) {
          info[rs.data.docs[j].templateCode] = rs.data.docs[j];
        }
      }
    }

    if (!filePath) {
      const r = getTranscode(filePath, info, doc);
      return cb && cb(null, isResultReturnWithMap ? [r] : r.template);
    }
    let files = [];

    if (filePath.indexOf(',') !== -1) {
      files = filePath.split(',');
    } else {
      files.push(filePath);
    }

    let result = [];

    for (let i = 0, len = files.length; i < len; i++) {
      result.push(getTranscode(files[i], info, doc));
    }

    if (!isResultReturnWithMap) {
      result = result[0].template;
    }

    return cb && cb(null, result);
  });
}

service.getTranscodeTemplate = function getTranscodeTemplate(id, filePath, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  service.getDetail(id, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc) {
      return cb && cb(i18n.t('templateIsNotExist'));
    }

    service.getTranscodeTemplateByDetail(doc, filePath, (err, r) => cb && cb(err, r), false);
  });
};

service.getTranscodeTemplateByDetail = function getTranscodeTemplateByDetail(doc, filePath, cb, isResultReturnWithMap) {
  filterTranscodeTemplates(doc, filePath, (err, r) => cb && cb(err, r), isResultReturnWithMap);
};

service.searchUserOrGroup = function searchUserOrGroup(info, cb) {
  roleService.searchUserOrGroup(info, cb);
};

service.updateTemplateGroupUsers = function updateTemplateGroupUsers(info, cb) {
  const _id = info._id || '';
  const users = info.users;

  const struct = {
    _id: { type: 'string', validation: 'require' },
    users: { type: 'array', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  const updateInfo = {
    users,
    modifyTime: new Date(),
  };
  templateGroupInfo.collection.updateOne({ _id }, { $set: updateInfo }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.getWatermark = function getWatermark(info, res) {
  const id = info.objectid || '';
  const struct = {
    objectid: { type: 'string', validation: 'require' },
  };

  const err = utils.validation(info, struct);

  if (err) {
    res.end(err.message);
  }

  const url = `http://${config.TRANSCODE_API_SERVER.hostname}:${config.TRANSCODE_API_SERVER.port}/TemplateService/getWatermark?watermarkId=${id}`;
  request.get(url).on('error', (error) => {
    logger.error(error);
    res.end(error.message);
  }).pipe(res);
};

module.exports = service;
