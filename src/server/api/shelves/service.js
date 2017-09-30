/**
 * Created by chaoningx on 2017/9/22.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const uuid = require('uuid');
const i18n = require('i18next');
const roleService = require('../role/service');

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
  }, '-createdTime');
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
      {name:{ $regex: keyword, $options: 'i' }},
      {programNO:{ $regex: keyword, $options: 'i' }},
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
  const info = req.body;
  const force = info.force || false;

  info.creator = { _id: userInfo._id, name: userInfo.name };
  info.department = userInfo.department;
  const t = new Date();
  info.createdTime = t;
  info.lastModifyTime = t;
  if (!info.programNO) {
    info.programNO = uuid.v1();
  }
  delete info.force;
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
      {name:{ $regex: keyword, $options: 'i' }},
      {programNO:{ $regex: keyword, $options: 'i' }},
      {'dealer.name':{ $regex: keyword, $options: 'i' }},
      {'assignee.name':{ $regex: keyword, $options: 'i' }},
    ];
  }

  query['department._id'] = userInfo.department._id;
  query['dealer._id'] = userInfo._id;

  listShelfTask(query, page, pageSize, cb);
};

// 获取详情
service.getShelfDetail = function getShelfDetail(info, cb) {
  const _id = info._id;
  if (!_id) {
    return cb & cb(i18n.t('shelfShortId'));
  }

  shelfTaskInfo.collection.findOne({ _id }, (err, doc) => {
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
    shelfTaskInfo.collection.update({ _id }, { $set: { editorInfo } }, (err) => {
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
    };
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
  const userInfo = req.ex.userInfo;
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
      {name:{ $regex: keyword, $options: 'i' }},
      {programNO:{ $regex: keyword, $options: 'i' }},
    ];
  }

  query['department._id'] = userInfo.department._id;

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

      return cb && cb(null, 'ok');
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

module.exports = service;
