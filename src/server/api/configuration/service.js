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
  configurationGroupInfo.insertOne(o, (err, r) => {
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
};

service.addConfig = function addConfig(o = {}, cb) {
  configurationInfo.insertOne(o, (err, r) => {
    if (err) {
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateConfigGroup = function updateConfigGroup(id, o = {}, cb) {
  if (o.children) {
    o.children = [...new Set(o.children.split(','))];
  }
  configurationInfo.updateOne({ _id: id }, o, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, r);
  });
};

service.updateConfig = function updateConfig(id, o = {}, cb) {
  if (o.id) {
    delete o.id;
  }
  configurationInfo.updateOne({ _id: id }, o, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    return cb && cb(null, r);
  });
};

// function treenify(array, parent = { id: '' }, tree = []) {
//   const newA = array.forEach((o) => {
//     console.log(_.pick(o, ['_id', 'parent', 'children', 'name']));
//   });
//
//   console.log('newA:', newA);
//   const children = _.filter(array, child => child.parent === parent.id);
//   if (!_.isEmpty(children)) {
//     if (parent.id === '') {
//       tree = children;
//     } else {
//       parent.children = children;
//     }
//     _.each(children, child => treenify(array, child));
//   }
//   return tree;
// }

service.listConfigGroup = function listConfigGroup(parent, type = 'plain', cb) {
  const query = {};
  if (parent !== undefined) {
    query.parent = parent;
  }
  configurationGroupInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (type === 'plain') {
      docs.forEach((o) => {
        o.id = o._id;
        delete o._id;
      });
    }

    return cb && cb(err, docs);
  });
};

service.listConfig = function listConfig(page, pageSize, groupId, keyword, cb) {
  const query = {};
  if (groupId !== undefined) {
    query.genre = groupId;
  }
  if (keyword !== undefined) {
    query.$or = [
      { key: { $regex: keyword, $options: 'i' } },
      { value: { $regex: keyword, $options: 'i' } },
    ];
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
