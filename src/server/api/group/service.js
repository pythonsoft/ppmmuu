/**
 * Created by steven on 2017/6/20.
 */
const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const GroupInfo = require('./groupInfo');
const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');
const userInfo = new UserInfo();

const config =  require('../../config');

let service = {};

service.listGroup = function(parentId, page, pageSize, cb) {
  let q = {};

  if(parentId) {
    q.parentId = parentId;
  }

  groupInfo.pagination(q, page, pageSize, function(err, docs) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, docs);
  });
};

service.listAllChildGroup = function(id, fields, cb) {
  let groups = [];

  if(!fields.hasOwnProperty('_id')) {
    fields._id = 1;
  }

  const ids = id.constructor === Array ? id : [id];

  const listGroup = function(ids) {
    groupInfo.collection.find({ parentId: { $in: ids } }).project(fields).toArray(function(err, docs) {
      if(err) {
        return cb && cb(i18n.t('databaseError'));
      }

      if(!docs) {
        cb && cb(null, groups);
      }

      groups = groups.concat(docs);
      let temp = [];

      for(let i = 0, len = docs.length; i < len; i++) {
        temp.push(docs[i]._id);
      }

      listGroup(temp);
    });
  };

  listGroup(ids);
};

service.listAllParentGroup = function(parentId, fields, cb) {
  let groups = [];
  
  if(!fields.hasOwnProperty('_id')) {
    fields._id = 1;
  }
  
  const listGroup = function(parentId) {
    groupInfo.collection.findOne({ _id: parentId }, function(err, doc) {
      if(err) {
        return cb && cb(i18n.t('databaseError'));
      }
      
      if(!doc) {
        cb && cb(null, groups);
      }
      
      groups = groups.concat(doc);
      listGroup(doc.parentId);
    });
  };
  
  listGroup(parentId);
};

service.getGroup = function(id, cb) {
  if(!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  groupInfo.collection.findOne({ _id: id }, function(err, doc) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, doc);
  });
};

service.addGroup = function(parentId, info, cb) {
  if(!parentId) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  info._id = info._id || uuid.v1();
  info.count = info.count ? info.count * 1 : 0;
  if(typeof info.count !== 'number') {
    info.count = 0;
  }

  if(!info.parentId) {
    info.parentId = parentId;
  }

  groupInfo.collection.findOne({ _id: parentId }, { fields: { _id: 1 } }, function(err, doc) {
    if(err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(!doc) {
      return cb && cb(i18n.t('aboveGroupIsNotExist'));
    }

    groupInfo.collection.insertOne(groupInfo.assign(info), function(err, r) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      cb && cb(null, r);
    });

  });
};

const updateGroup = function(id, updateDoc, cb) {
  groupInfo.collection.updateOne({ _id: id }, { $set: updateDoc }, function(err, r) {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    cb && cb(null, r);
  });
};

service.updateGroup = function(id, updateInfo, cb) {
  if(!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  const updateDoc = groupInfo.updateAssign(updateInfo);

  if(updateDoc.count) {
    updateDoc.count = updateDoc.count * 1;
    if(typeof updateDoc.count !== 'number') {
      updateDoc.count = 0;
    }
  }

  if(updateDoc.parentId) {
    groupInfo.collection.findOne({ _id: updateDoc.parentId }, { fields: { _id: 1 } }, function(err, doc) {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if(!doc) {
        delete updateDoc.parentId;
      }

      updateGroup(id, updateDoc, cb);
    });
  }else {
    updateGroup(id, updateDoc, cb);
  }

};

service.deleteGroup = function(id, cb) {
  if(!id) {
    return cb && cb(i18n.t('groupIdIsNull'));
  }

  const removeGroup = function(type, groupIds, callback) {
    let q = {};
    let updateDoc = {};

    if(type === GroupInfo.TYPE.COMPANY) {
      q.company._id = id;
      updateDoc.company = {};
      updateDoc.department = {};
      updateDoc.team = {};
    }else if(type === GroupInfo.TYPE.DEPARTMENT) {
      q.department._id = id;
      updateDoc.department = {};
      updateDoc.team = {};
    }else if(type === GroupInfo.TYPE.TEAM) {
      q.team._id = id;
      updateDoc.team = {};
    }

    userInfo.collection.updateMany(q, { $set: updateDoc }, function(err, r) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      groupInfo.collection.removeMany({ _id: { $in: groupIds }}, function(err, r) {
        if(err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        callback && callback(r);
      });

    });
  };
  const listAllChildGroup = function(callback) {

    service.listAllChildGroup(id, { _id: 1, deleteDeny: 1, name: 1 }, function(err, groups) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      let deleteDenyName = [];
      let groupIds = [];

      groupIds.push(id);

      for(let i = 0, len = groups.length; i < len; i++) {
        if(groups[i].deleteDeny === GroupInfo.DELETE_DENY.YES) {
          deleteDenyName.push(groups[i].name);
        }
        groupIds.push(groups[i]._id);
      }

      if(deleteDenyName.length !== 0) {
        return cb && cb(i18n.t('cannotDeleteProtectGroup', { groupNames: deleteDenyName.join(',') }));
      }

      callback && callback(groupIds);
    });
  };
  const getRootGroup = function(callback) {
    groupInfo.collection.findOne({ _id: id }, { fields: { _id: 1, type: 1, deleteDeny: 1 } }, function(err, doc) {
      if(err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if(!doc) {
        return cb && cb(i18n.t('groupIsNotExist'));
      }

      if(doc.deleteDeny === GroupInfo.DELETE_DENY.YES) {
        return cb && cb(i18n.t('groupDeleteDenyIsYes'));
      }

      callback && callback(doc);
    });
  };

  getRootGroup(function(doc) {
    listAllChildGroup(function(groupIds) {
      removeGroup(doc.type, groupIds, function(r) {
        cb && cb(null, r);
      });
    });
  });

};

module.exports = service;
