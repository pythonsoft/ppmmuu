/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const uuid = require('uuid');

const ProjectInfo = require('./projectInfo');

const projectInfo = new ProjectInfo();

const ItemInfo = require('./itemInfo');

const itemInfo = new ItemInfo();

const service = {};
const createSnippetOrDirItem = function createSnippetOrDirItem(creatorId, name, parentId, type = ItemInfo.TYPE.DIRECTORY, canRemove = ItemInfo.CAN_REVMOE.YES, snippet = {}, details = {}, cb) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  if (!name) {
    return cb && cb(i18n.t('ivideoItemNameIsNull'));
  }

  if (!parentId) {
    return cb && cb(i18n.t('ivideoParentIdIsNull'));
  }

  const info = { _id: uuid.v1(), name, creatorId, parentId, type, snippet, details, canRemove };

  itemInfo.insertOne(info, (err, r, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r, doc._id);
  });
};

service.createSnippetOrDirItem = createSnippetOrDirItem;

service.ensureAccountInit = function ensureMyResource(creatorId, cb) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  projectInfo.collection.findOne({ creatorId, type: ProjectInfo.TYPE.MY_RESOURCE }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    let isNew = false;

    if (doc) {
      return cb(null, doc, isNew);
    }

    isNew = true;

    projectInfo.insertOne({
      name: i18n.t('ivideoProjectDefaultName').message,
      type: ProjectInfo.TYPE.MY_RESOURCE,
      creatorId,
    }, (err, r, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      createSnippetOrDirItem(creatorId, i18n.t('ivideoItemDefaultName').message, doc._id, ItemInfo.TYPE.DEFAULT_DIRECTORY, ItemInfo.CAN_REVMOE.NO, {}, {}, err => cb && cb(err, doc, isNew));
      // service.createProject(creatorId, i18n.t('ivideoProjectDefaultNameNull').message, ProjectInfo.TYPE.PROJECT_RESOURCE, '0', (err, projectDoc) => cb && cb(err, { myResource: doc, defaultProject: projectDoc }));
    });
  });
};

service.createProject = function createProject(creatorId, name, type = ProjectInfo.TYPE.PROJECT_RESOURCE, canRemove = '1', cb) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  if (!name) {
    return cb && cb(i18n.t('ivideoProjectNameIsNull'));
  }

  const info = { creatorId, name, type, canRemove };

  projectInfo.insertOne(info, (err, r, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r, doc);
  });
};

service.listItem = function listItem(creatorId, parentId, type, cb, sortFields = 'createdTime', fieldsNeed) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  if (!parentId) {
    return cb && cb(i18n.t('ivideoParentIdIsNull'));
  }

  const query = { creatorId, parentId };

  if (type) {
    if (type.indexOf(',') !== -1) {
      query.type = { $in: type.split(',') };
    } else {
      query.type = type;
    }
  }

  const cursor = itemInfo.collection.find(query);

  if (fieldsNeed) {
    cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
  }

  cursor.sort = utils.formatSortOrFieldsParams(sortFields, true);

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.createDirectory = function createDirectory(creatorId, name, parentId, details, cb) {
  createSnippetOrDirItem(creatorId, name, parentId, ItemInfo.TYPE.DIRECTORY, ItemInfo.CAN_REVMOE.YES, {}, {}, (err, r) => cb && cb(err, r));
};

service.createItem = function createItem(creatorId, name, parentId, snippet, details, cb) {
  let snippetInfo = {};

  if (snippet) {
    if (typeof snippet === 'string') {
      let info = {};

      try {
        info = JSON.parse(snippet);
      } catch (e) {
        return cb && cb(e.message);
      }

      snippetInfo = utils.merge({
        thumb: '',
        input: 0,
        output: 1,
        duration: 0,
        objectId: '',
        fileTypeId: ''
      }, info);
    } else {
      snippetInfo = snippet;
    }
  }

  const callback = function callback(pid) {
    createSnippetOrDirItem(creatorId, name, pid, ItemInfo.TYPE.SNIPPET, ItemInfo.CAN_REVMOE.YES, snippetInfo, details, (err, r) => cb && cb(err, r));
  };

  if (!parentId) {
    itemInfo.collection.findOne({ creatorId, type: ItemInfo.TYPE.DEFAULT_DIRECTORY }, { fields: { _id: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if(!doc) {
        return cb && cb(i18n.t('ivideoDefaultDirectoryIsNull'));
      }

      callback(doc._id);
    });
  } else {
    callback(parentId);
  }
};

service.removeItem = function removeItem(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('ivideoRemoveItemIdIsNull'));
  }

  itemInfo.collection.findOne({ _id: id }, { fields: { canRemove: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('ivideoRemoveItemIsNull'));
    }

    if (doc.canRemove === ItemInfo.CAN_REVMOE.NO) {
      return cb && cb(i18n.t('ivideoDefaultDirectoryCanNotRemove'));
    }

    itemInfo.collection.removeOne({ _id: id }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.updateItem = function updateItem(id, name, details, cb) {
  if (!id) {
    return cb && cb(i18n.t('ivideoRemoveItemIdIsNull'));
  }

  const update = {};

  update.modifyTime = new Date();

  if (name) {
    update.name = name;
  }

  if (details) {
    update.details = details;
  }

  if (utils.isEmptyObject(update)) {
    return cb && cb(null, 'ok');
  }

  itemInfo.updateOne({ _id: id }, update, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.removeProject = function removeProject(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('ivideoRemoveProjectIdIsNull'));
  }

  projectInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(null, doc);
    }

    if (doc.canRemove !== '1') {
      return cb && cb(i18n.t('ivideoProjectCanNotRemove'));
    }

    projectInfo.collection.removeOne({ _id: id }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  });
};

service.listProject = function listProject(creatorId, cb, sortFields = 'createdTime', fieldsNeed) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  const cursor = projectInfo.collection.find({ creatorId });

  if (fieldsNeed) {
    cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
  }

  cursor.sort = utils.formatSortOrFieldsParams(sortFields, true);

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getItem = function getItem(id, cb) {
  itemInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

service.getMyResource = function getMyResource(userId, cb) {
  projectInfo.collection.findOne({ userId, type: ProjectInfo.TYPE.MY_RESOURCE }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

module.exports = service;
