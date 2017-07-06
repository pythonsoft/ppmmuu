'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
// const utils = require('../../common/utils');
// const Token = require('../../common/token');
// const config = require('../../config');

const ConfigurationInfo = require('./configurationInfo');
const ConfigurationGroupInfo = require('./configurationGroupInfo');

const configurationInfo = new ConfigurationInfo();
const configurationGroupInfo = new ConfigurationGroupInfo();

const service = {};

service.addConfigGroup = function addConfigGroup(o = {}, cb) {
  const err = configurationGroupInfo.validateCreateError(configurationGroupInfo.createNeedValidateFields, o);

  if (err) {
    return cb && cb(err);
  }

  configurationGroupInfo.checkUnique(o, false, (err) => {
    if (err) {
      return cb && cb(err);
    }
    configurationGroupInfo.collection.insertOne(configurationGroupInfo.assign(o), (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      if (!o.parent) {
        return cb && cb(null, r);
      }
      configurationGroupInfo.collection.updateOne({ _id: o.parent }, { $addToSet: { children: r.insertedId } }, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, r);
      });
    });
  });
};

service.addConfig = function addConfig(o = {}, cb) {
  const err = configurationInfo.validateCreateError(configurationInfo.createNeedValidateFields, o);

  if (err) {
    return cb && cb(err);
  }

  configurationInfo.checkUnique(o, false, (err) => {
    if (err) {
      return cb && cb(err);
    }
    configurationInfo.collection.insertOne(configurationInfo.assign(o), (err, r) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.updateConfigGroup = function updateConfigGroup(id, o = {}, cb) {
  const err = configurationGroupInfo.validateUpdateError(configurationGroupInfo.updateNeedValidateFields, o);
  if (err) {
    return cb && cb(err);
  }
  configurationGroupInfo.checkUnique(o, true, () => {
    if (err) {
      return cb && cb(err);
    }
    if (o.children) {
      o.children = [...new Set(o.children.split(','))];
    }
    configurationInfo.collection.updateOne({ _id: id }, { $set: o }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, r);
    });
  });
};

service.updateConfig = function updateConfig(id, o = {}, cb) {
  const err = configurationInfo.validateUpdateError(configurationInfo.updateNeedValidateFields, o);
  if (err) {
    return cb && cb(err);
  }
  configurationInfo.checkUnique(o, true, () => {
    if (err) {
      return cb && cb(err);
    }
    configurationInfo.collection.updateOne({ _id: id }, { $set: o }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, r);
    });
  });
};

service.listConfigGroup = function listConfigGroup(cb) {
  configurationGroupInfo.collection.find().toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(err, docs);
  });
};

service.listConfig = function listConfig(page, pageSize, groupId, cb) {
  const query = {};
  if (groupId) {
    query.genre = groupId;
  }
  configurationInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

function findAllChildren(docs, parent) {
  const children = [parent];
  const needToCheck = [parent];
  while (needToCheck.length !== 0) {
    const check = needToCheck.pop();
    for (let i = docs.length - 1; i >= 0; i--) {
      if (docs[i].parent === check) {
        const item = docs.splice(i, 1);
        needToCheck.push(item[0]._id);
        children.push(item[0]._id);
      }
    }
  }
  return children;
}

function deleteConfigByGenre(genres, cb) {
  configurationGroupInfo.collection.deleteMany({ genre: { $in: genres } }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, r);
  });
}

function deleteChildrenByParent(parent, cb) {
  if (!parent) {
    return cb && cb(i18n.t('validateError', { param: 'parent' }));
  }
  configurationGroupInfo.collection.find().toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (docs.length === 0) {
      return cb && cb(i18n.t('validateError', { param: 'parent' }));
    }
    const children = findAllChildren(docs, parent);
    deleteConfigByGenre(children, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      configurationGroupInfo.collection.deleteMany({ _id: { $in: children } }, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        return cb && cb(null, r);
      });
    });
  });
}

service.deleteConfigGroup = function deleteConfigGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('validateError', { param: 'id' }));
  }
  deleteChildrenByParent(id, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    configurationGroupInfo.collection.findOneAndUpdate({ children: id }, { $pull: { children: id } }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, r);
    });
  });
};

service.deleteConfig = function deleteConfig(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('validateError', { param: 'id' }));
  }
  configurationInfo.collection.deleteOne({ _id: id }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

module.exports = service;
