/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const config = require('../../config');
const path = require('path');
const fs = require('fs');
const uuid = require('uuid');
const i18n = require('i18next');
const roleService = require('../role/service');
const subscribeManagementService = require('../subscribeManagement/service');
const mediaService = require('../media/service');
const templateService = require('../template/service');
const fieldConfig = require('../subscribe/fieldConfig');

const ShelfTaskInfo = require('./shelfTaskInfo');
const CatalogInfo = require('../library/catalogInfo');
const UserInfo = require('../user/userInfo');

const shelfTaskInfo = new ShelfTaskInfo();
const userInfo = new UserInfo();

const libraryExtService = require('../library/extService');

const service = {};

const getTaskFileName = function getTaskFileName(files) {
  if (files && files.length) {
    let name = files[0].name;
    name = name.split('.')[0];
    return name;
  }
  return '';
};

const listShelfTask = function listShelfTask(query, page, pageSize, cb) {
  shelfTaskInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const items = docs.docs;
    if (items && items.length) {
      for (let i = 0, len = items.length; i < len; i++) {
        items[i].outpoint = items[i].details.OUTPOINT || 0;
        items[i].inpoint = items[i].details.INPOINT || 0;
        if (items[i].editorInfo && items[i].editorInfo.subscribeType && items[i].editorInfo.subscribeType.constructor.name === 'Array') {
          items[i].editorInfo.subscribeType = items[i].editorInfo.subscribeType.join(',');
        }
        delete items[i].details;
      }
    }

    return cb && cb(null, docs);
  }, '-createdTime', '-files,-full_text');
};

service.listShelfTask = listShelfTask;

const listDepartmentShelfTask = function listDepartmentShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  const info = req.query;
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
      { 'editorInfo.fileName': { $regex: keyword, $options: 'i' } },
    ];
  }

  query['department._id'] = userInfo.department._id;

  listShelfTask(query, page, pageSize, cb);
};

// 列出部门上架任务(全部)
service.listDepartmentAllShelfTask = function listDepartmentAllShelfTask(req, cb) {
  listDepartmentShelfTask(req, cb);
};

// 列出部门上架任务(待认领)
service.listDepartmentPrepareShelfTask = function listDepartmentPrepareShelfTask(req, cb) {
  req.query.status = ShelfTaskInfo.STATUS.PREPARE;
  listDepartmentShelfTask(req, cb);
};

// 认领
service.claimShelfTask = function claimShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  _ids = _ids.split(',');

  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, status: { $ne: ShelfTaskInfo.STATUS.PREPARE } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistOtherStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.DOING,
      dealer: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
      operationTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids } }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

// 派发
service.assignShelfTask = function assignShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';
  const dealer = req.body.dealer || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  if (!dealer) {
    return cb && cb(i18n.t('shelfShortDealer'));
  }

  _ids = _ids.split(',');

  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, status: { $ne: ShelfTaskInfo.STATUS.PREPARE } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistOtherStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.DOING,
      dealer,
      assignee: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
      operationTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids } }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

const clearCover = function clearCover(_ids, cb) {
  shelfTaskInfo.collection.find({ _id: { $in: _ids } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs && docs.length) {
      docs.forEach((item) => {
        const cover = item.editorInfo.cover;
        if (cover) {
          const coverArr = cover.split('uploads/');
          if (coverArr.length > 1) {
            const coverPath = path.join(config.uploadPath, coverArr[1]);
            if (fs.existsSync(coverPath)) {
              fs.unlinkSync(coverPath);
            }
          }
        }
      });
    }
    return cb && cb(null);
  });
};

// 删除
service.deleteShelfTask = function deleteShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  _ids = _ids.split(',');
  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, status: ShelfTaskInfo.STATUS.DELETE }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistDeleteStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.DELETE,
      lastDeleter: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids } }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      // 删除磁盘上封面
      clearCover(_ids, () => {});
      return cb && cb(null, 'ok');
    });
  });
};

const getUserInfo = function getUserInfo(query, cb) {
  userInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }
    return cb && cb(null, doc);
  });
};

// 创建上架任务
service.createShelfTask = function createShelfTask(info, cb) {
  const objectId = info.objectId || '';
  info.fromWhere = info.fromWhere || CatalogInfo.FROM_WHERE.MAM;
  const t = new Date();
  info.createdTime = t;
  info.lastModifyTime = t;
  if (!info.programNO) {
    info.programNO = uuid.v1();
  }
  delete info.force;
  const result = shelfTaskInfo.assign(info);
  if (result.err) {
    return cb && cb(result.err);
  }
  info = result.doc;
  if (!info._id) {
    info._id = uuid.v1();
  }
  if (info.name) {
    info.editorInfo.name = info.name;
  }
  if (info.fileName) {
    info.editorInfo.fileName = info.fileName.split('.')[0];
  }
  getUserInfo({ _id: info.creator._id }, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }
    info.department = doc.department;
    mediaService.getObject({ objectid: objectId, fromWhere: info.fromWhere }, (err, rs) => {
      if (err) {
        return cb && cb(err);
      }
      const program = rs.result.detail.program;
      const basic = rs.result.basic;
      info.files = [];
      for (const key in basic) {
        info.details[key] = basic[key];
      }
      info.editorInfo.fileName = basic.NAME;
      if (info.details.OUTPOINT) {
        info.details.duration = info.details.OUTPOINT - info.details.INPOINT;
      }
      for (let i = 0, len = program.length; i < len; i++) {
        const item = program[i];
        if (item.value === 'N/A') {
          info.details[item.key] = new Date('1900-01-01').toISOString();
        } else {
          info.details[item.key] = item.value;
        }
        if (!info.name) {
          if (item.key === 'FIELD195') {
            info.name = item.value;
            info.editorInfo.name = item.value;
          }
          if (item.key === 'FIELD196' && !info.editorInfo.name) {
            info.name = item.value;
            info.editorInfo.name = item.value;
          }
          if (item.key === 'FIELD276') {
            info.editorInfo.source = item.value;
          }
        }
      }
      if (!info.editorInfo.name) {
        info.editorInfo.name = info.name;
      }
      info.editorInfo.cover = `${config.domain}/media/getIcon?objectid=${objectId}&fromWhere=${info.fromWhere}`;


      // 为了订阅搜索统一一下搜索字段和香港接口一样
      const FILED_MAP = {
        newsTime: 'FIELD162',
        airTime: 'FIELD36',
        version: 'FIELD323',
      };

      for (const key in FILED_MAP) {
        if (info.details[key]) {
          info.details[FILED_MAP[key]] = info.details[key];
        }
      }
      shelfTaskInfo.insertOne(info, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }

        return cb && cb(null, info._id);
      });
    });
  });
};

// 我的任务列表
service.listMyselfShelfTask = function listMyselfShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  const info = req.query;
  const keyword = info.keyword || '';
  const status = info.status || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 20;
  let _ids = info._ids || '';
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
      { 'editorInfo.fileName': { $regex: keyword, $options: 'i' } },
    ];
  }

  query['department._id'] = userInfo.department._id;
  query['dealer._id'] = userInfo._id;
  if (_ids) {
    _ids = _ids.split(',');
    query._id = { $in: _ids };
  }

  listShelfTask(query, page, pageSize, cb);
};

// 获取详情
service.getShelfDetail = function getShelfDetail(info, cb) {
  const _id = info._id;
  let fields = info.fields || '';
  const status = info.status || '';
  const query = {};

  if (!_id) {
    return cb & cb(i18n.t('shelfShortId'));
  }

  query._id = _id;
  if (status && utils.isValueInObject(status, ShelfTaskInfo.STATUS)) {
    query.status = status;
  }

  if (fields) {
    fields = utils.formatSortOrFieldsParams(fields);
  } else {
    fields = null;
  }

  shelfTaskInfo.collection.findOne({ _id }, { fields }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('shelfNotFind'));
    }
    if (!doc.editorInfo.subscribeType || doc.editorInfo.subscribeType === []) {
      doc.editorInfo.subscribeType = '';
      return cb && cb(null, doc);
    }
    if (doc.editorInfo && doc.editorInfo.subscribeType && doc.editorInfo.subscribeType.constructor.name === 'String') {
      doc.editorInfo.subscribeType = doc.editorInfo.subscribeType.split(',');
    }
    subscribeManagementService.getSubscribeTypeByQuery({ _id: { $in: doc.editorInfo.subscribeType } }, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }
      const subscribeText = [];
      if (docs && docs.length) {
        docs.forEach((item) => {
          subscribeText.push(`${item.name}(${item._id})`);
        });
      }
      doc.editorInfo.subscribeTypeText = subscribeText.join(',');
      doc.editorInfo.subscribeType = doc.editorInfo.subscribeType.join(',');
      return cb && cb(null, doc);
    });
  });
};

service.getShelfAndSubscription = function getShelfAndSubscription(info, cb) {
  service.getShelfDetail(info, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const result = {};
    const rs = [];
    result.fromWhere = doc.fromWhere || CatalogInfo.FROM_WHERE.MAM;
    rs.push({
      key: 'name',
      cn: '节目名称(中文)',
      value: doc.editorInfo.name,
    });
    rs.push({
      key: 'subscribeType',
      cn: '订阅类型',
      value: doc.editorInfo.subscribeTypeText,
    });
    rs.push({
      key: 'limit',
      cn: '限制',
      value: doc.editorInfo.limit,
    });
    rs.push({
      key: 'fileName',
      cn: '文件名',
      value: doc.details.NAME,
    });
    rs.push({
      key: 'cover',
      cn: '封面',
      value: doc.editorInfo.cover,
    });
    if (doc.details) {
      const program = doc.details;
      for (const key in fieldConfig) {
        if (key !== 'NAME') {
          rs.push({
            key,
            cn: fieldConfig[key].cn,
            value: program[key] || '',
          });
        }
      }
    }
    result.details = rs;
    return cb && cb(null, result);
  });
};

// 保存
service.saveShelf = function saveShelf(info, cb) {
  const _id = info._id;
  const editorInfo = info.editorInfo || '';
  const struct = {
    _id: { type: 'string', validation: 'require' },
    editorInfo: { type: 'object', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  shelfTaskInfo.collection.findOne({ _id, status: ShelfTaskInfo.STATUS.DOING }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('shelfCanNotSave'));
    }
    shelfTaskInfo.collection.update({ _id }, { $set: { editorInfo, name: editorInfo.name, lastModifyTime: new Date(), full_time: new Date() } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

const loopUpdateCover = function loopUpdateCover(cover, _ids, index, cb) {
  if (!cover) {
    return cb && cb(null);
  }

  if (!_ids.length) {
    return cb && cb(null);
  }

  if (index >= _ids.length) {
    return cb && cb(null);
  }

  const _id = _ids[index];
  let srcPath = cover.split('/');
  const srcPathLen = srcPath.length;
  if (srcPathLen < 2) {
    return cb && cb(null);
  }
  srcPath = path.join(config.uploadPath, srcPath[srcPathLen - 1]);
  const fileName = uuid.v1();
  const destPath = path.join(config.uploadPath, fileName);
  if (!fs.existsSync(srcPath)) {
    return cb && cb(null);
  }
  fs.copyFileSync(srcPath, destPath);
  const url = `${config.domain}/uploads/${fileName}`;
  shelfTaskInfo.collection.update({ _id }, { $set: { 'editorInfo.cover': url } }, (err) => {
    if (err) {
      logger.error(err.message);
    }
    loopUpdateCover(cover, _ids, index + 1, cb);
  });
};
// 保存
service.batchSaveShelf = function batchSaveShelf(info, cb) {
  let _ids = info._ids;
  const firstId = info.firstId;
  const editorInfo = info.editorInfo || '';
  const name = editorInfo.name || '';
  delete editorInfo.name;
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    editorInfo: { type: 'object', validation: 'require' },
    firstId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  _ids = _ids.split(',');
  if (err) {
    return cb && cb(err);
  }

  const updateInfo = {
    lastModifyTime: new Date(),
    full_time: editorInfo.airTime || new Date(),
    'editorInfo.subscribeType': editorInfo.subscribeType,
    'editorInfo.limit': editorInfo.limit,
    'editorInfo.airTime': editorInfo.airTime,
  };
  shelfTaskInfo.collection.updateMany({ _id: { $in: _ids }, status: ShelfTaskInfo.STATUS.DOING }, { $set: updateInfo }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const firstUpdateInfo = {
      lastModifyTime: new Date(),
      full_time: editorInfo.airTime || new Date(),
      'editorInfo.subscribeType': editorInfo.subscribeType,
      'editorInfo.limit': editorInfo.limit,
      'editorInfo.cover': editorInfo.cover,
      'editorInfo.name': name,
      name,
    };
    shelfTaskInfo.collection.update({ _id: firstId, status: ShelfTaskInfo.STATUS.DOING }, { $set: firstUpdateInfo }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      const index = _ids.indexOf(firstId);
      _ids.splice(index, 1);
      return cb && cb(null, 'ok');
      // loopUpdateCover(editorInfo.cover, _ids, 0, () => cb && cb(null, 'ok'));
    });
  });
};

// 提交
service.submitShelf = function submitShelf(info, cb) {
  const userInfo = info.userInfo;
  const _id = info._id;
  const editorInfo = info.editorInfo || '';
  const struct = {
    _id: { type: 'string', validation: 'require' },
    editorInfo: { type: 'object', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  shelfTaskInfo.collection.findOne({ _id, 'dealer._id': userInfo._id, status: ShelfTaskInfo.STATUS.DOING, packageStatus: ShelfTaskInfo.PACKAGE_STATUS.COMPLETED }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('shelfCanNotSave'));
    }
    const updateInfo = {
      lastSubmitter: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      'editorInfo.limit': editorInfo.limit,
      'editorInfo.subscribeType': editorInfo.subscribeType,
      status: ShelfTaskInfo.STATUS.SUBMITTED,
      full_text: '',
      lastModifyTime: new Date(),
      full_time: new Date(),
    };
    if (editorInfo.name) {
      updateInfo.name = editorInfo.name;
      updateInfo['editorInfo.name'] = editorInfo.name;
    }
    if (editorInfo.airTime) {
      updateInfo['editorInfo.airTime'] = editorInfo.airTime;
      updateInfo.full_time = editorInfo.airTime;
    }
    if (editorInfo.cover) {
      updateInfo['editorInfo.cover'] = editorInfo.cover;
    }
    for (const key in doc.editorInfo) {
      if (typeof doc.editorInfo[key] === 'string') {
        updateInfo.full_text += `${doc.editorInfo[key]} `;
      }
    }
    for (const key in doc.details) {
      if (typeof doc.details[key] === 'string') {
        updateInfo.full_text += `${doc.details[key]}`;
      }
    }
    shelfTaskInfo.collection.update({ _id, 'dealer._id': userInfo._id }, { $set: updateInfo }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

// 批量提交
service.batchSubmitShelf = function batchSubmitShelf(info, cb) {
  let _ids = info._ids;
  const firstId = info.firstId;
  const editorInfo = info.editorInfo || '';
  const name = editorInfo.name || '';
  const cover = editorInfo.cover || '';
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    editorInfo: { type: 'object', validation: 'require' },
    firstId: { type: 'string', validation: 'require' },
  };
  _ids = _ids.split(',');
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  const loopSubmitSelf = function loopSubmitSelf(index) {
    if (index >= _ids.length) {
      return cb && cb(null, 'ok');
      // const index = _ids.indexOf(firstId);
      // _ids.splice(index, 1);
      // loopUpdateCover(editorInfo.cover, _ids, 0, () => cb && cb(null, 'ok'));
    }
    info._id = _ids[index];
    info.editorInfo = editorInfo;
    if (firstId === info._id) {
      info.editorInfo.name = name;   // 第一个的名字要保存
      info.editorInfo.cover = cover;
    } else {
      delete info.editorInfo.name;
      delete info.editorInfo.cover;
    }
    service.submitShelf(info, (err) => {
      if (err) {
        return cb && cb(err);
      }
      loopSubmitSelf(index + 1);
    });
  };
  loopSubmitSelf(0);
};

service.sendBackShelf = function sendBackShelf(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  _ids = _ids.split(',');

  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, 'dealer._id': userInfo._id, status: { $ne: ShelfTaskInfo.STATUS.DOING } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistNotDoingStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.PREPARE,
      lastDeleter: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids }, 'dealer._id': userInfo._id }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

/** 上架管理* */

// 上架列表
service.listLineShelfTask = function listLineShelfTask(req, cb) {
  const info = req.query;
  const keyword = info.keyword || '';
  const status = info.status || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 20;
  const query = {};

  if (status) {
    if (ShelfTaskInfo.LINE_STATUS.indexOf(status) === -1) {
      return cb && cb(i18n.t('shelfStatusNotCorrect'));
    }
    if (status.indexOf(',') !== -1) {
      query.status = { $in: status.split(',') };
    } else {
      query.status = status;
    }
  } else {
    query.status = { $in: ShelfTaskInfo.LINE_STATUS };
  }

  if (keyword) {
    query.$or = [
      { name: { $regex: keyword, $options: 'i' } },
      { programNO: { $regex: keyword, $options: 'i' } },
      { 'dealer.name': { $regex: keyword, $options: 'i' } },
      { 'editorInfo.fileName': { $regex: keyword, $options: 'i' } },
    ];
  }

  // query['department._id'] = userInfo.department._id;

  listShelfTask(query, page, pageSize, cb);
};

// 上架
service.onlineShelfTask = function onlineShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  _ids = _ids.split(',');

  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, status: { $ne: ShelfTaskInfo.STATUS.SUBMITTED } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistNotSubmittedStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.ONLINE,
      lastOnliner: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids } }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      const loopDistribute = function loopDistribute(index, callback) {
        if (index >= _ids.length) {
          return callback && callback(null);
        }

        service.distribute(userInfo, '', _ids[index], () => {
          loopDistribute(index + 1, callback);
        });
      };

      loopDistribute(0, () => cb && cb(null, 'ok'));
    });
  });
};

// 下架
service.offlineShelfTask = function offlineShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let _ids = req.body._ids || '';

  if (!_ids) {
    return cb && cb(i18n.t('shelfShortIds'));
  }

  _ids = _ids.split(',');
  shelfTaskInfo.collection.findOne({ _id: { $in: _ids }, status: { $ne: ShelfTaskInfo.STATUS.ONLINE } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('shelfExistNotOnlineStatus'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.OFFLINE,
      lastOffliner: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id: { $in: _ids } }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

// 下架的再编辑
service.editShelfTaskAgain = function editShelfTaskAgain(req, cb) {
  const userInfo = req.ex.userInfo;
  const _id = req.body._id || '';

  if (!_id) {
    return cb && cb(i18n.t('shelfShortId'));
  }

  shelfTaskInfo.collection.findOne({ _id, status: { $ne: ShelfTaskInfo.STATUS.OFFLINE } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (doc) {
      return cb && cb(i18n.t('NotOfflineStatusCanNotEditAgain'));
    }
    const updateInfo = {
      status: ShelfTaskInfo.STATUS.DOING,
      lastEditAgainer: {
        _id: userInfo._id,
        name: userInfo.name,
      },
      lastModifyTime: new Date(),
    };
    shelfTaskInfo.collection.update({ _id }, { $set: updateInfo }, { multi: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

service.searchUser = function searchUser(req, cb) {
  const departmentId = req.ex.userInfo.department._id;
  const keyword = req.query.keyword || '';
  const type = roleService.SEARCH_TYPE.USER;
  const info = {
    departmentId,
    keyword,
    type,
  };
  roleService.searchUserOrGroup(info, cb);
};

service.listSubscribeType = function listSubscribeType(info, cb) {
  info.pageSize = 999;
  subscribeManagementService.listSubscribeType(info, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }

    return cb && cb(null, rs);
  });
};

service.getShelfTaskSubscribeType = function getShelfTaskSubscribeType(shelfTaskId, cb) {
  if (!shelfTaskId) {
    return cb && cb(i18n.t('shelfObjectIdIsNull'));
  }

  shelfTaskInfo.collection.findOne({ _id: shelfTaskId }, { fields: { editorInfo: 1, files: 1, objectId: 1, subscribeType: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('shelfNotFind'));
    }

    return cb && cb(null, doc);
  });
};

service.getShelf = function getShelf(id, fieldNeed, cb) {
  if (!id) {
    return cb & cb(i18n.t('shelfShortId'));
  }

  shelfTaskInfo.collection.findOne({ _id: id }, { fields: utils.formatSortOrFieldsParams(fieldNeed, false) }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

/**
 * 用于通知JAVA服务，有新的文件产生
 * @param userInfo {Object} 这个是下载模板中的脚本解析需要使用
 * @param templateId {String} 下载模板ID
 * @param objectId {String} 上架内容的objectId
 * @param cb
 * @returns {*}
 */
service.distribute = function distribute(userInfo, templateId, shelfTaskId, cb) {
  if (!templateId) {
    templateId = config.subscribeDownloadTemplateId;
  }

  if (utils.isEmptyObject(userInfo)) {
    return cb && cb(i18n.t('jobDistributeFieldIsNull', { field: 'userInfo' }));
  }

  if (!templateId) {
    return cb && cb(i18n.t('jobDistributeFieldIsNull', { field: 'templateId' }));
  }

  if (!shelfTaskId) {
    return cb && cb(i18n.t('jobDistributeFieldIsNull', { field: 'objectId' }));
  }

  // 拿到下载模版信息
  templateService.getDownloadPath(userInfo, templateId, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }

    const downloadPath = rs.downloadPath;
    const bucketId = rs.bucketInfo._id;

    service.getShelf(shelfTaskId, '_id,objectId,files', (err, shelf) => {
      if (err) {
        return cb && cb(err);
      }

      if (!shelf) {
        return cb && cb(i18n.t('shelfInfoIsNull'));
      }

      const downs = [];
      let file = null;

      // 目前只有MAM数据源时这样处理是可以了，但是如果添加了新的数据源，此处需要变更
      if (shelf.objectId) {
        for (let i = 0, len = shelf.files.length; i < len; i++) {
          file = shelf.files[i];
          downs.push({
            objectid: shelf.objectId,
            inpoint: file.INPOINT, // 起始帧
            outpoint: 0, // 结束帧
            filename: file.FILENAME,
            filetypeid: file.FILETYPEID,
            destination: downloadPath, // 相对路径，windows路径 格式 \\2017\\09\\15
            targetname: '', // 文件名,不需要文件名后缀，非必须
          });
        }
      } else {
        return cb && cb(i18n.t('jobSourceNotSupport'));
      }

      const p = {
        downloadParams: JSON.stringify(downs),
        bucketId,
        distributionId: shelf._id,
      };

      const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/DistributionService/distribute`;

      utils.requestCallApi(url, 'POST', p, '', (err, rs) => {
        if (err) {
          return cb && cb(err);
        }

        if (rs.status === '0') {
          return cb && cb(null, 'ok');
        }

        return cb && cb(i18n.t('jobDistributeError', { error: rs.statusInfo.message }));
      });
    });
  });
};


service.updatePackageStatus = function updatePackageStatus(id, packageStatus, cb) {
  const updateInfo = {
    lastModifyTime: new Date(),
    packageStatus,
  };
  shelfTaskInfo.collection.update({ _id: id }, { $set: updateInfo }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, 'ok');
    // loopUpdateCover(editorInfo.cover, _ids, 0, () => cb && cb(null, 'ok'));
  });
};

service.getFilesById = function getFilesById(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('libraryFileInfoFieldIsNull', { field: '_id' }));
  }

  shelfTaskInfo.collection.find({ _id }, { fields: { files: 1, fromWhere: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

const fillStreamUrlToFiles = function fillStreamUrlToFiles(files, fromWhere, cb) {
  libraryExtService.getMapPath(fromWhere, (err, mapPath) => {
    if (err) {
      return cb && cb(err);
    }
    for (let i = 0, len = files.length; i < len; i++) {
      const rs = {
        FILENAME: files[i].name,
        INPOINT: files[i].inpoint,
        OUTPOINT: files[i].outpoint,
        UNCPATH: files[i].path,
        mapPath,
      };
      files[i].streamUrl = utils.getStreamUrl(rs, fromWhere);
      // files[i].downloadUrl = `${config.streamURL}/download?path=${files[i].path}`;
    }
    return cb && cb(null, files);
  });
};

service.addFilesToTask = function addFilesToTask(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    files: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  let newFiles = info.files;
  try {
    newFiles = JSON.parse(newFiles);
    if (newFiles.constructor.name !== 'Array') {
      return cb && cb(i18n.t('shelfTaskFilesIsInValid'));
    }
  } catch (e) {
    return cb && cb(i18n.t('shelfTaskFilesIsInValid'));
  }
  shelfTaskInfo.collection.findOne({ _id: info._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t(i18n.t('shelfNotFind')));
    }

    let files = doc.files || [];
    if (files && files.length > 0) {
      for (let i = 0, len1 = newFiles.length; i < len1; i++) {
        const newFile = newFiles[i];
        newFile.shelfTaskId = info._id;
        let flag = true;
        for (let j = 0, len2 = files.length; j < len2; j++) {
          const file = files[j];
          if (newFile.type === file.type) {
            files[j] = newFile;
            flag = false;
            break;
          }
        }
        if (flag) {
          files.push(newFile);
        }
      }
    } else {
      for (let i = 0, len1 = newFiles.length; i < len1; i++) {
        newFiles[i].shelfTaskId = info._id;
      }
      files = newFiles;
    }
    fillStreamUrlToFiles(files, 'ONLINE_SHELF', (err, files) => {
      if (err) {
        return cb && cb(err);
      }
      shelfTaskInfo.collection.updateOne({ _id: info._id }, { $set: { files } }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        return cb && cb(null, 'ok');
      });
    });
  });
};

// 上架
service.warehouse = function warehouse(info, cb) {
  const struct = {
    processId: { type: 'string', validation: 'require' },
    shelveTemplateId: { type: 'string', validation: 'require' },
    objectId: { type: 'string', validation: 'require' },
    fileName: { type: 'string', validation: 'require' },
    fromWhere: { type: 'string', validation: 'require' },
    fileType: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  const checkForce = function (callback) {
    if (!info.force) {
      return callback && callback(null);
    }
    shelfTaskInfo.collection.findOne({ objectId: info.objectId }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (doc) {
        return cb && cb(i18n.t('shelfHasExists'));
      }
    });
  };

  checkForce((err) => {
    if (err) {
      return cb && cb(err);
    }

    const params = {
      processId: info.processId,
      paramJson: {},
    };
    params.paramJson = {
      objectId: info.objectId,
      userId: info.creator._id,
      userName: info.creator.name,
      fileName: info.fileName,
      shelveTemplateId: info.shelveTemplateId,
      fromWhere: info.fromWhere,
      fileType: info.fileType,
      catalogName: info.catalogName || '',
    };

    params.paramJson = JSON.stringify(params.paramJson);

    console.log(JSON.stringify(params));
    const url = `http://${config.JOB_API_SERVER.hostname}:${config.JOB_API_SERVER.port}/ProcessInstanceService/create`;
    utils.requestCallApi(url, 'POST', params, '', (err, rs) => {
      if (err) {
        return cb && cb(err); // res.json(result.fail(err));
      }

      if (rs.status === '0') {
        return cb && cb(null, 'ok');
      }
      return cb && cb(i18n.t('joDownloadError', { error: rs.statusInfo.message }));
    });
  });
};

service.batchSubmitByIds = function batchSubmitByIds(info, cb) {
  let _ids = info._ids || '';
  const struct = {
    _ids: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  _ids = _ids.split(',');
  shelfTaskInfo.collection.find({ _id: { $in: _ids }, status: ShelfTaskInfo.STATUS.DOING }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length !== _ids.length) {
      return cb && cb(i18n.t('shelfExistNotDoingStatus'));
    }
    for (let i = 0, len = docs.length; i < len; i++) {
      const item = docs[i];
      if (item.editorInfo) {
        const struct = {
          name: { type: 'string', validation: 'require' },
          subscribeType: { type: 'array', validation: 'require' },
          limit: { type: 'string', validation: 'require' },
          cover: { type: 'string', validation: 'require' },
          airTime: { type: 'string', validation: 'require' },
        };
        const err = utils.validation(item.editorInfo, struct);
        if (err) {
          return cb && cb(i18n.t('shelfEditorInfoRequired', { name: item.name }));
        }
      } else {
        return cb && cb(i18n.t('shelfEditorInfoRequired', { name: item.name }));
      }
    }
    shelfTaskInfo.collection.updateMany({ _id: { $in: _ids }, status: ShelfTaskInfo.STATUS.DOING }, { $set: { status: ShelfTaskInfo.STATUS.SUBMITTED } }, (err) => {
      if (err) {
        logger.error(err);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, 'ok');
    });
  });
};

module.exports = service;
