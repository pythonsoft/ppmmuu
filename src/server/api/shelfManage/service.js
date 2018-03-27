'use strict';

const i18n = require('i18next');
const path = require('path');
const utils = require('../../common/utils');
const vm = require('vm');
const uuid = require('uuid');
const logger = require('../../common/log')('error');
const ShelfTaskInfo = require('../shelves/shelfTaskInfo');
const TemplateInfo = require('./templateInfo');
const FastEditTemplateInfo = require('./fastEditTemplateInfo');
const UserInfo = require('../user/userInfo');
const CatalogInfo = require('../library/catalogInfo');
const shelfService = require('../shelves/service');
const jobService = require('../job/service');
const storageService = require('../storage/service');

const templateInfo = new TemplateInfo();
const fastEditTemplateInfo = new FastEditTemplateInfo();
const userInfo = new UserInfo();

const service = {};

service.listShelfTask = function listShelfTask(info, cb) {
  const keyword = info.keyword || '';
  const status = info.status || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 20;
  const query = {};

  if (status) {
    if (ShelfTaskInfo.DEAL_STATUS.indexOf(status) === -1) {
      return cb && cb(i18n.t('shelfStatusNotCorrect'));
    }
    if (status.indexOf(',') !== -1) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  } else {
    query.status = { $in: ShelfTaskInfo.DEAL_STATUS };
  }

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { programNO: { $regex: keyword, $options: 'i' } },
      { 'assignee.name': { $regex: keyword, $options: 'i' } },
      { 'dealer.name': { $regex: keyword, $options: 'i' } },
    ];
  }

  shelfService.listShelfTask(query, page, pageSize, cb);
};


/* 上架模板 */
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

service.addTemplate = function addTemplate(info, cb) {
  const t = new Date();
  if (!info._id) {
    info._id = uuid.v1();
  }
  info.createdTime = t;
  info.lastModifyTime = t;

  templateInfo.insertOne(info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, 'ok');
  });
};

service.getTemplateInfo = function getTemplateInfo(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('shelfTemplateInfoFieldIsNull', { field: '_id' }));
  }

  templateInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.listTemplate = function listCatalogTask(fieldsNeed, page = 1, pageSize = 20, cb) {
  const query = { };

  templateInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createdTime', fieldsNeed);
};

service.removeTemplate = function removeTemplate(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('shelfTemplateInfoFieldIsNull', { field: '_id' }));
  }

  templateInfo.collection.removeOne({ _id }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.updateTemplate = function updateTemplate(_id, info, cb) {
  if (!_id) {
    return cb && cb(i18n.t('shelfTemplateInfoFieldIsNull', { field: '_id' }));
  }
  const t = new Date();
  delete info._id;
  info.lastModifyTime = t;
  templateInfo.updateOne({ _id }, info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, info);
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

service.getShelfTemplateResult = function getShelfTemplateResult(id, filePath, cb) {
  if (!id) {
    return cb && cb(i18n.t('templateIdIsNotExist'));
  }

  const rs = {
    bucketId: '',
    transcodeTemplates: [],
  };

  service.getTemplateInfo(id, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc) {
      return cb && cb(i18n.t('templateIsNotExist'));
    }
    rs.bucketId = doc.bucketId;
    rs.transcodeTemplates = [];

    service.getTranscodeTemplateByDetail(doc, filePath, (err, arr) => {
      if (err) {
        return cb && cb(err);
      }
      delete doc.transcodeTemplateDetail;
      if (!arr || arr.constructor.name !== 'Array') {
        return cb && cb(i18n.t('shelfTemplateTranscodeTemplateIsInvalid'));
      }
      storageService.getBucketDetail(doc.bucketId, (err, bucketInfo) => {
        if (err) {
          return cb && cb(err);
        }

        if (!bucketInfo) {
          return cb && cb(i18n.t('templateBucketIsNotExist'));
        }

        const user = { name: '' };
        user.password = '';

        runDownloadScript(user, bucketInfo, doc.script, (err, downloadPath) => {
          if (err) {
            return cb && cb(err);
          }
          if (!downloadPath || downloadPath.constructor.name !== 'Array') {
            return cb && cb(i18n.t('shelfTemplateScriptIsInvalid'));
          }
          const tLen = arr.length;
          const pLen = downloadPath.length;

          if (tLen !== pLen) {
            return cb && cb(i18n.t('shelfTemplateScriptIsInvalid'));
          }

          for (let i = 0; i < tLen; i++) {
            const temp = {
              id: arr[i],
              storagePath: downloadPath[i],
            };
            rs.transcodeTemplates.push(temp);
          }
          return cb && cb(null, rs);
        });
      });
    }, false);
  });
};

service.getTranscodeTemplateByDetail = function getTranscodeTemplateByDetail(doc, filePath, cb, isResultReturnWithMap) {
  filterTranscodeTemplates(doc, filePath, (err, r) => cb && cb(err, r), isResultReturnWithMap);
};

service.listFastEditTemplate = function listFastEditTemplate(info, cb) {
  const page = info.page || 1;
  const pageSize = info.pageSize || 15;
  const fieldsNeed = info.fieldsNeed || '';
  const query = {};

  fastEditTemplateInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createdTime', fieldsNeed);
};

service.addFastEditTemplate = function addFastEditTemplate(info, cb) {
  const t = new Date();
  if (!info._id) {
    info._id = uuid.v1();
  }
  info.createdTime = t;
  info.lastModifyTime = t;

  fastEditTemplateInfo.insertOne(info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, 'ok');
  });
};

service.updateFastEditTemplate = function updateFastEditTemplate(info, cb) {
  const _id = info._id;
  const t = new Date();
  if (!_id) {
    return cb && cb(i18n.t('fastEditTemplateInfoFieldIsNull', { field: '_id' }));
  }

  delete info._id;
  info.lastModifyTime = t;
  fastEditTemplateInfo.updateOne({ _id }, info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, info);
  });
};

service.removeFastEditTemplate = function removeFastEditTemplate(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('fastEditTemplateInfoFieldIsNull', { field: '_id' }));
  }

  fastEditTemplateInfo.collection.removeOne({ _id }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.getFastEditTemplateInfo = function getFastEditTemplateInfo(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('fastEditTemplateInfoFieldIsNull', { field: '_id' }));
  }

  fastEditTemplateInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.getFastEditTemplateInfoResult = function getFastEditTemplateInfoResult(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('fastEditTemplateInfoFieldIsNull', { field: '_id' }));
  }

  fastEditTemplateInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    storageService.getBucketDetail(doc.bucketId, (err, bucketInfo) => {
      if (err) {
        return cb && cb(err);
      }

      if (!bucketInfo) {
        return cb && cb(i18n.t('fastTemplateBucketIsNotExist'));
      }

      const user = { name: '' };
      user.password = '';

      runDownloadScript(user, bucketInfo, doc.script, (err, downloadPath) => {
        if (err) {
          return cb && cb(err);
        }
        if (!downloadPath) {
          return cb && cb(i18n.t('fastTemplateScriptIsInvalid'));
        }
        delete doc.script;
        doc.storagePath = downloadPath;
        return cb && cb(null, doc);
      });
    });
  });
};

service.getDefaultFastEditTemplateInfo = function getDefaultFastEditTemplateInfo(cb) {
  fastEditTemplateInfo.collection.findOne({}, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('noFastEditTemplateFound'));
    }
    return cb && cb(null, doc);
  });
};

service.getDefaultTemplateInfo = function getDefaultTemplateInfo(cb) {
  fastEditTemplateInfo.collection.findOne({}, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('noShelfTemplateFound'));
    }
    return cb && cb(null, doc);
  });
};

service.updatePackageStatus = shelfService.updatePackageStatus;

service.createShelfTask = function createShelfTask(info, cb) {
  const creator = info.creator || '';
  if (!creator || !creator._id) {
    return cb && cb(i18n.t('createShelfTaskCreatorIsInvalid'));
  }
  info.force = true;
  info.isDirect = ShelfTaskInfo.IS_DIRECT.NO;
  info.packageStatus = info.packageStatus || ShelfTaskInfo.PACKAGE_STATUS.PREPARE;
  info.fromWhere = info.fromWhere || CatalogInfo.FROM_WHERE.HK_RUKU;

  userInfo.collection.findOne({ _id: creator._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }
    info.department = doc.department;
    shelfService.createShelfTask(info, cb);
  });
};

service.getShelfTaskProcess = function getShelfTaskProcess(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  return cb && cb(null, 'ok');
  // const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/JobService/shelfTask/${info._id}`;
  // utils.requestCallApi(url, 'GET', param, '', (err, rs) => {
  //   if (err) {
  //     return cb && cb(err); // res.json(result.fail(err));
  //   }
  //
  //   if (rs.status === '0') {
  //     return cb && cb(null, rs.result);
  //   } else {
  //     return cb && cb(i18n.t('joDownloadError', { error: rs.statusInfo.message }));
  //   }
  // });
};

module.exports = service;
