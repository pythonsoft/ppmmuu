/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const config = require('../../config');
const uuid = require('uuid');
const i18n = require('i18next');
const roleService = require('../role/service');
const subscribeManagementService = require('../subscribeManagement/service');
const mediaService = require('../media/service');
const templateService = require('../template/service');

const ShelfTaskInfo = require('./shelfTaskInfo');

const shelfTaskInfo = new ShelfTaskInfo();

const service = {};

const listShelfTask = function listShelfTask(query, page, pageSize, cb) {
  shelfTaskInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, '-createdTime', '-files,-details,-full_text');
};

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

      return cb && cb(null, 'ok');
    });
  });
};

// 创建上架任务
service.createShelfTask = function createShelfTask(req, cb) {
  const userInfo = req.ex.userInfo;
  let info = req.body;
  const force = info.force || false;
  const objectId = info.objectId || '';

  info.creator = { _id: userInfo._id, name: userInfo.name };
  info.department = userInfo.department;
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
  info.editorInfo.name = info.name;
  mediaService.getObject({ objectid: objectId }, (err, rs) => {
    if (err) {
      return cb && cb(err);
    }
    const program = rs.result.detail.program;
    const basic = rs.result.basic;
    info.files = rs.result.files;
    for (const key in basic) {
      info.details[key] = basic[key];
    }
    if (info.details.OUTPOINT) {
      info.details.duration = info.details.OUTPOINT - info.details.INPOINT;
    }
    for (const key in program) {
      info.details[key] = program[key].value;
    }

    if (force) {
      shelfTaskInfo.insertOne(info, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }

        return cb && cb(null, info._id);
      });
    } else {
      shelfTaskInfo.collection.findOne({ objectId: info.objectId }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }
        if (doc) {
          return cb && cb(i18n.t('shelfHasExists'));
        }
        shelfTaskInfo.insertOne(info, (err) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(err);
          }

          return cb && cb(null, info._id);
        });
      });
    }
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
    ];
  }

  query['department._id'] = userInfo.department._id;
  query['dealer._id'] = userInfo._id;

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

  const getSubscribeTypeById = function getSubscribeTypeById(id, callback) {
    if (!id) {
      return callback && callback(null, '');
    }

    subscribeManagementService.getSubscribeType(query, (err, doc) => {
      if (err) {
        return callback && callback(null, '');
      }

      return callback && callback(null, doc.name);
    });
  };

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

    getSubscribeTypeById(doc.editorInfo.subscribeType, (err, name) => {
      if (err) {
        return cb && cb(err);
      }
      doc.editorInfo.subscribeType = name || doc.editorInfo.subscribeType;
      return cb && cb(null, doc);
    });
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
    shelfTaskInfo.collection.update({ _id }, { $set: { editorInfo, name: editorInfo.name } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

// 提交
service.submitShelf = function submitShelf(req, cb) {
  const userInfo = req.ex.userInfo;
  const info = req.body;
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

  shelfTaskInfo.collection.findOne({ _id, 'dealer._id': userInfo._id, status: ShelfTaskInfo.STATUS.DOING }, (err, doc) => {
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
      editorInfo,
      status: ShelfTaskInfo.STATUS.SUBMITTED,
      full_text: '',
      name: editorInfo.name,
    };
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

service.listSubscribeType = function listSubscribeType(cb) {
  const info = { pageSize: 999 };
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
            outpoint: file.OUTPOINT, // 结束帧
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

module.exports = service;
