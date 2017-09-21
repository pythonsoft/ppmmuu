/**
 * Created by steven on 2017/7/18.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const uuid = require('uuid');

const GroupInfo = require('./groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const RoleInfo = require('../role/roleInfo');

const roleInfo = new RoleInfo();

const PermissionInfo = require('../role/permissionInfo');

const permissionInfo = new PermissionInfo();

const PermissionAssignmentInfo = require('../role/permissionAssignmentInfo');

const permissionAssignmentInfo = new PermissionAssignmentInfo();

const config = require('../../config');

const roleService = require('../role/service');

const ivideoService = require('../ivideo/service');

const service = {};

service.getUserGroups = function getUserGroups(doc, cb) {
  const companyId = doc.company ? doc.company._id : '';
  const departmentId = doc.department ? doc.department._id : '';
  const teamId = doc.team ? doc.team._id : '';
  const groupIds = [];
  if (companyId) {
    groupIds.push(companyId);
  }
  if (departmentId) {
    groupIds.push(departmentId);
  }
  if (teamId) {
    groupIds.push(teamId);
  }

  if (groupIds.length === 0) {
    return cb && cb(null, doc);
  }
  groupInfo.collection.find({ _id: { $in: groupIds } }, { fields: { name: 1 } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    for (let i = 0, len = docs.length; i < len; i++) {
      const temp = docs[i];
      if (temp._id === companyId) {
        doc.company = temp;
      } else if (temp._id === departmentId) {
        doc.department = temp;
      } else if (temp._id === teamId) {
        doc.team = temp;
      }
    }
    return cb && cb(null, doc);
  });
};

service.getGroupUserDetail = function getGroupUserDetail(_id, cb) {
  userInfo.getUserInfo(_id, '', (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    service.getUserGroups(doc, cb);
  });
};

const getGroups = function getGroupUsers(query, cb) {
  groupInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('cannotFindGroup'));
    }

    return cb && cb(null, docs);
  });
};

const fillUserInfo = function fillUserInfo(_ids, info, cb) {
  if (info.password) {
    info.password = utils.cipher(info.password, config.KEY);
  }

  if (!_ids || _ids.length === 0) {
    return cb && cb(null, info);
  }
  getGroups({ _id: { $in: _ids } }, (err, docs) => {
    if (err) {
      return cb && cb(err);
    }

    if (docs.length !== _ids.length) {
      return cb && cb(i18n.t('cannotFindGroup'));
    }

    for (let i = 0; i < docs.length; i++) {
      const group = docs[i];
      if (group.type === GroupInfo.TYPE.COMPANY) {
        info.company = {
          _id: group._id,
          name: group.name,
        };
      } else if (group.type === GroupInfo.TYPE.DEPARTMENT) {
        info.department = {
          _id: group._id,
          name: group.name,
        };
      } else if (group.type === GroupInfo.TYPE.TEAM) {
        info.team = {
          _id: group._id || '',
          name: group.name || '',
        };
      }
    }
    return cb && cb(null, info);
  });
};

service.addGroupUser = function addGroupUser(info, cb) {
  const _ids = [];

  if (!utils.checkPassword(info.password) && info.verifyType === UserInfo.VERIFY_TYPE.PASSWORD) {
    return cb && cb(i18n.t('validationError', { field: 'password' }));
  }

  info._id = uuid.v1();

  _ids.push(info.companyId);

  if (info.departmentId) {
    _ids.push(info.departmentId);
  }

  if (info.teamId) {
    _ids.push(info.teamId);
  }

  fillUserInfo(_ids, info, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.insertOne(info, (err) => {
      if (err) {
        return cb && cb(err);
      }

      ivideoService.ensureAccountInit(info._id, err => cb && cb(err, 'ok'));
    });
  });
};

service.updateGroupUser = function updateGroupUser(info, cb) {
  const _ids = [];

  if (info.verifyType === UserInfo.VERIFY_TYPE.PASSWORD && !utils.checkPassword(info.password)) {
    return cb && cb(i18n.t('validationError', { field: 'password' }));
  }

  if (info.companyId) {
    _ids.push(info.companyId);
  } else if (info.companyId === '') {
    info.company = {
      _id: '',
      name: '',
    };
  }

  if (info.departmentId) {
    _ids.push(info.departmentId);
  } else if (info.departmentId === '') {
    info.department = {
      _id: '',
      name: '',
    };
  }

  if (info.teamId) {
    _ids.push(info.teamId);
  } else if (info.teamId === '') {
    info.team = {
      _id: '',
      name: '',
    };
  }

  fillUserInfo(_ids, info, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.updateOne(
      { _id: info._id }, info, (err) => {
        if (err) {
          return cb && cb(err);
        }

        roleService.clearRedisCache(info._id, () => cb && cb(null, 'ok'));
      });
  });
};

service.justifyUserGroup = function justifyUserGroup(info, cb) {
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    departmentId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  const groupIds = [];
  groupIds.push(info.departmentId);
  if (info.teamId) {
    groupIds.push(info.teamId);
  }

  const updeteInfo = {};
  const _ids = info._ids.split(',');

  fillUserInfo(groupIds, updeteInfo, (err, info) => {
    if (err) {
      return cb && cb(err);
    }

    userInfo.collection.updateMany(
      { _id: { $in: _ids } }, { $set: info }, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
  });
};

service.getGroupUserList = function getGroupUserList(info, cb) {
  if (info.status === 'all') {
    delete info.status;
  }

  const struct = {
    _id: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { return utils.isValueInObject(v, GroupInfo.TYPE); } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const _id = info._id;
  const type = info.type;
  const page = info.page || 1;
  const pageSize = info.pageSize || 30;
  const keyword = info.keyword || '';
  const query = {};

  if (type === GroupInfo.TYPE.COMPANY) {
    query['company._id'] = _id;
  } else if (type === GroupInfo.TYPE.DEPARTMENT) {
    query['department._id'] = _id;
  } else {
    query['team._id'] = _id;
  }

  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  if (info.status) {
    query.status = info.status;
  }

  userInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.updateOwnerPermission = function updateOwnerPermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { return utils.isValueInObject(v, PermissionAssignmentInfo.TYPE); } },
    roles: { type: 'array', validation: 'require' },
    permissions: { type: 'array', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }
  const permissions = info.permissions;
  const roles = info.roles;
  const allowedPermissions = [];
  const deniedPermissions = [];
  const tempRoles = [];
  for (let i = 0, len = permissions.length; i < len; i++) {
    if (permissions[i].action === '允许') {
      allowedPermissions.push(permissions[i].path);
    } else {
      deniedPermissions.push(permissions[i].path);
    }
  }
  for (let i = 0, len = roles.length; i < len; i++) {
    tempRoles.push(roles[i]._id);
  }
  const updateInfo = {
    _id: info._id,
    type: info.type,
    roles: tempRoles,
    allowedPermissions,
    deniedPermissions,
    modifyTime: new Date(),
  };

  const checkType = function checkType(_id, type, callback) {
    if (type === PermissionAssignmentInfo.TYPE.USER) {
      userInfo.collection.findOne({ _id }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }
        if (!doc) {
          return cb && cb(i18n.t('userNotFind'));
        }
        return callback && callback(null);
      });
    } else {
      if (type === PermissionAssignmentInfo.TYPE.COMPANY) {
        type = GroupInfo.TYPE.COMPANY;
      } else if (type === PermissionAssignmentInfo.TYPE.DEPARTMENT) {
        type = GroupInfo.TYPE.DEPARTMENT;
      } else {
        type = GroupInfo.TYPE.TEAM;
      }
      groupInfo.collection.findOne({ _id, type }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(err);
        }
        if (!doc) {
          return cb && cb(i18n.t('cannotFindGroup'));
        }
        return callback && callback(null);
      });
    }
  };

  checkType(info._id, info.type, (err) => {
    if (err) {
      return cb && cb(err);
    }

    permissionAssignmentInfo.collection.updateOne({ _id: info._id, type: info.type }, { $set: updateInfo }, { upsert: true }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      roleService.clearRedisCache(info._id, () => cb & cb(null));
    });
  });
};

service.getOwnerPermission = function getOwnerPermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const getRoles = function getRoles(roles, callback) {
    if (!roles || roles.length === 0) {
      return callback && callback(null, []);
    }
    roleInfo.collection.find({ _id: { $in: roles } }, { fields: { name: 1 } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    });
  };

  const getPermissions = function getPermissions(permissions, callback) {
    if (!permissions || permissions.length === 0) {
      return callback && callback(null, []);
    }
    permissionInfo.collection.find({ path: { $in: permissions } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return callback && callback(null, docs);
    });
  };

  permissionAssignmentInfo.collection.findOne({ _id: info._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, { _id: '', type: '', roles: [], permissions: [] });
    }

    const rs = {
      _id: doc._id,
      type: doc.type,
    };
    const roles = doc.roles || [];
    const allowedPermissions = doc.allowedPermissions || [];
    const deniedPermissions = doc.deniedPermissions || [];
    const permissions = [];

    getRoles(roles, (err, docs) => {
      if (err) {
        return cb && cb(err);
      }

      rs.roles = docs;

      getPermissions(allowedPermissions, (err, docs) => {
        if (err) {
          return cb && cb(err);
        }

        for (let i = 0, len = docs.length; i < len; i++) {
          const temp = docs[i];
          temp.action = '允许';
          permissions.push(temp);
        }

        getPermissions(deniedPermissions, (err, docs) => {
          if (err) {
            return cb && cb(err);
          }

          for (let i = 0, len = docs.length; i < len; i++) {
            const temp = docs[i];
            temp.action = '拒绝';
            permissions.push(temp);
          }
          rs.permissions = permissions;

          return cb && cb(null, rs);
        });
      });
    });
  });
};

service.listAllParentGroup = function listAllParentGroup(parentId, fields, cb) {
  let groups = [];
  fields = fields ? { fields: utils.formatSortOrFieldsParams(fields) } : { fields: null };

  const listGroup = function listGroup(parentId) {
    groupInfo.collection.findOne({ _id: parentId }, fields, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null, groups);
      }

      groups = groups.concat(doc);
      listGroup(doc.parentId);
    });
  };

  listGroup(parentId);
};

const getRolesPermissions = function getRolesPermissions(roles, cb) {
  const permissions = { allowedPermissions: [], deniedPermissions: [] };
  if (roles && roles.length) {
    roleInfo.collection.find({ _id: { $in: roles } }).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      for (let i = 0, len = docs.length; i < len; i++) {
        permissions.allowedPermissions = permissions.allowedPermissions.concat(docs[i].allowedPermissions);
        permissions.deniedPermissions = permissions.deniedPermissions.concat(docs[i].deniedPermissions);
      }
      return cb && cb(null, permissions);
    });
  } else {
    return cb && cb(null, permissions);
  }
};

const getAssignPermissionByIds = function getAssignPermissionByIds(ids, cb) {
  const assignPermissionArr = [];

  permissionAssignmentInfo.collection.find({ _id: { $in: ids } }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (docs && docs.length) {
      for (let i = 0, len = ids.length; i < len; i++) {
        for (let j = 0, len1 = docs.length; j < len1; j++) {
          if (ids[i] === docs[j]._id) {
            assignPermissionArr.push(docs[j]);
          }
        }
      }
    }

    return cb && cb(null, assignPermissionArr);
  });
};

const getPermissionAssignIds = function getPermissionAssignIds(type, _id, callback) {
  const permissionAssignIds = [];
  if (type === PermissionAssignmentInfo.TYPE.USER) {
    userInfo.collection.findOne({ _id }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return callback && callback(i18n.t('databaseError'));
      }
      if (!doc) {
        return callback && callback(i18n.t('userNotFind'));
      }
      permissionAssignIds.push(_id);
      let groupId = '';
      if (doc.team && doc.team._id) {
        groupId = doc.team._id;
      } else if (doc.department && doc.department._id) {
        groupId = doc.department._id;
      } else if (doc.company && doc.company._id) {
        groupId = doc.company._id;
      }

      if (groupId) {
        service.listAllParentGroup(groupId, '_id', (err, groups) => {
          if (err) {
            return callback && callback(err);
          }
          permissionAssignIds.push(groupId);
          for (let i = 0, len = groups.length; i < len; i++) {
            permissionAssignIds.push(groups[i]._id);
          }

          return callback && callback(null, permissionAssignIds);
        });
      } else {
        return callback && callback(null, permissionAssignIds);
      }
    });
  } else {
    service.listAllParentGroup(_id, '_id', (err, groups) => {
      if (err) {
        return callback && callback(err);
      }
      permissionAssignIds.push(_id);
      for (let i = 0, len = groups.length; i < len; i++) {
        permissionAssignIds.push(groups[i]._id);
      }

      return callback && callback(null, permissionAssignIds);
    });
  }
};

const getAllPermissionArr = function getAllPermissionArr(assignPermissionArr, cb) {
  const allPermissionArr = [];
  const getPermissions = function getPermissions(index) {
    if (index >= assignPermissionArr.length) {
      return cb && cb(null, allPermissionArr);
    }
    const temp = assignPermissionArr[index];
    temp.allowedPermissions = temp.allowedPermissions || [];
    temp.deniedPermissions = temp.deniedPermissions || [];
    if (temp.allowedPermissions.length || temp.deniedPermissions.length) {
      allPermissionArr.push({
        allowedPermissions: temp.allowedPermissions,
        deniedPermissions: temp.deniedPermissions,
      });
    }
    const roles = temp.roles || [];
    getRolesPermissions(roles, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }
      allPermissionArr.push(doc);
      getPermissions(index + 1);
    });
  };
  getPermissions(0);
};

const getAllowedOrDeniedPermissions = function getAllowedPermissions(docs, isAllowed) {
  const length = docs.length;
  const key1 = isAllowed ? 'allowedPermissions' : 'deniedPermissions';
  const key2 = isAllowed ? 'deniedPermissions' : 'allowedPermissions';
  let allowed = [];

  const filterPermission = function filterPermission(allowed, denied) {
    const result = [];
    for (let i = 0; i < allowed.length; i++) {
      if (denied.indexOf(allowed[i]) === -1) {
        result.push(allowed[i]);
      }
    }
    return result;
  };


  for (let i = length - 1; i >= 0; i--) {
    let denied = docs[i][key2] || [];
    for (let j = i - 1; j >= 0; j--) {
      const tempDenied = docs[j][key2] || [];
      denied = utils.hardMerge(denied, tempDenied);
    }
    allowed = utils.hardMerge(allowed, (filterPermission(docs[i][key1], denied)));
  }

  return allowed;
};

service.getOwnerEffectivePermission = function getOwnerEffectivePermission(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
    type: { type: 'string', validation(v) { return utils.isValueInObject(v, PermissionAssignmentInfo.TYPE); } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  getPermissionAssignIds(info.type, info._id, (err, permissionAssignIds) => {
    if (err) {
      return cb && cb(err);
    }

    getAssignPermissionByIds(permissionAssignIds, (err, assignPermissionArr) => {
      if (err) {
        return cb && cb(err);
      }

      getAllPermissionArr(assignPermissionArr, (err, allPermissionArr) => {
        if (err) {
          return cb & cb(err);
        }

        const allowedPermissions = getAllowedOrDeniedPermissions(allPermissionArr, true);
        const deniedPermissions = getAllowedOrDeniedPermissions(allPermissionArr, false);
        const tempArr = allowedPermissions.concat(deniedPermissions);
        permissionInfo.collection.find({ path: { $in: tempArr } }).toArray((err, docs) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }
          for (let i = 0, len = docs.length; i < len; i++) {
            if (allowedPermissions.indexOf(docs[i].path) !== -1) {
              docs[i].action = '允许';
            } else {
              docs[i].action = '拒绝';
            }
          }
          return cb && cb(null, docs);
        });
      });
    });
  });
};

service.searchUser = function searchUser(info, cb) {
  const struct = {
    companyId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const keyword = info.keyword || '';
  const limit = 6;
  const query = {};
  query['company._id'] = info.companyId;
  if (keyword) {
    query.name = { $regex: keyword, $options: 'i' };
  }

  userInfo.collection.find(query, { fields: { name: 1, photo: 1, email: 1, phone: 1 } }).limit(limit).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.enableGroupUser = function enableGroupUser(info, cb) {
  const struct = {
    _ids: { type: 'string', validation: 'require' },
    status: { type: 'string', validation(v) { if (v === UserInfo.STATUS.NORMAL || v === UserInfo.STATUS.UNACTIVE) { return true; } return false; } },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  const _ids = info._ids.split(',');
  const status = info.status;

  userInfo.collection.updateMany({ _id: { $in: _ids } }, { $set: { status } },
    (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      roleService.clearRedisCache(_ids, () => cb && cb(null, 'ok'));
    });
};

service.deleteGroupUser = function deleteGroupUser(info, cb) {
  const struct = {
    _ids: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);

  if (err) {
    return cb && cb(err);
  }

  userInfo.collection.removeMany({ _id: { $in: info._ids.split(',') } }, (err) => {
    if (err) {
      logger.error(err.message);
      console.log(err);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};
module.exports = service;
