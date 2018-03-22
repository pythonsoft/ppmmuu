/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const uuid = require('uuid');
const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

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

const TYPE_CONFIG = {
  1: {
    apiTemplateUrl: 'shelfManage/fastEditTemplate/{$id}',
  },
  2: {
    apiTemplateUrl: '/library/template/{$id}',
  },
  3: {
    apiTemplateUrl: '/shelfManage/shelfTemplate/{$id}',
  },
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

  templateGroupInfo.updateOne({ _id: id }, updateDoc, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const name = updateDoc.name || '';

    if (name) {
      templateInfo.collection.updateMany({ groupId: id }, { $set: { groupName: name } }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        return cb && cb(null, 'ok');
      });
    } else {
      return cb && cb(null, 'ok');
    }
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

service.list = function list(type, groupId, groupName, sortFields = '-createdTime', fieldsNeed, page, pageSize = 20, cb) {
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
  if (groupName) {
    query.groupName = groupName;
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

service.createTemplate = function createTemplate(info, cb) {
  if (!info._id) {
    info._id = uuid.v1();
  }

  const t = new Date();

  info.createdTime = t;
  info.modifyTime = t;

  templateInfo.insertOne(info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });

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
  info.modifyTime = new Date();

  if (info._id) {
    delete info._id;
  }

  if (info.id) {
    delete info.id;
  }
  templateInfo.updateOne({ _id: id }, info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
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

module.exports = service;
