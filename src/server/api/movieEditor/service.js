/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');

const ProjectInfo = require('./projectInfo');

const projectInfo = new ProjectInfo();

const ItemInfo = require('./itemInfo');

const itemInfo = new ItemInfo();

const service = {};

service.ensureMyResource = function ensureMyResource(creatorId, cb) {
  if(!creatorId) {
    return cb && cb(i18n.t('movieEditorProjectCreatorIdIsNull'));
  }

  projectInfo.collection.findOne({ creatorId: creatorId, type: ProjectInfo.TYPE.MY_RESOURCE }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(doc) {
      return cb(null, doc);
    }

    projectInfo.insertOne({
      name: i18n.t('movieEditorProjectDefaultName').message,
      type: ProjectInfo.TYPE.MY_RESOURCE,
      creatorId: creatorId
    }, (err, r, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, doc);
    });

  });
};

service.createProject = function createProject(creatorId, name, type=ProjectInfo.TYPE.PROJECT_RESOURCE, cb) {
  if(!creatorId) {
    return cb && cb(i18n.t('movieEditorProjectCreatorIdIsNull'));
  }

  if(!name) {
    return cb && cb(i18n.t('movieEditorProjectNameIsNull'));
  }

  const info = { creatorId, name, type };

  projectInfo.insertOne(info, (err, r, doc) => {

    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r, doc);

  });
};

service.listItem = function listItem(creatorId, parentId, cb, sortFields='createdTime', fieldsNeed) {
  if(!creatorId) {
    return cb && cb(i18n.t('movieEditorProjectCreatorIdIsNull'));
  }

  if(!parentId) {
    return cb && cb(i18n.t('movieEditorParentIdIsNull'));
  }

  let cursor = itemInfo.collection.find({ creatorId, parentId });

  if(fieldsNeed) {
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

const createItem = function createItem(creatorId, name, parentId, type=ItemInfo.TYPE.DIRECTORY, snippet={}, details={}, cb) {
  if(!creatorId) {
    return cb && cb(i18n.t('movieEditorProjectCreatorIdIsNull'));
  }

  if(!name) {
    return cb && cb(i18n.t('movieEditorItemNameIsNull'));
  }

  if(!parentId) {
    return cb && cb(i18n.t('movieEditorParentIdIsNull'));
  }

  const info = { name, creatorId, parentId, type, snippet, details };

  itemInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  })
};

service.createDirectory = function createDirectory(creatorId, name, parentId, details, cb) {
  createItem(creatorId, name, parentId, ItemInfo.TYPE.DIRECTORY, {}, {}, cb);
};

service.createItem = function createItem(creatorId, name, parentId, snippet, details, cb) {
  let info = {};

  try {
    info = JSON.parse(snippet);
  }catch (e) {
    return cb && cb(e.message);
  }

  const snippetInfo = utils.merge({
    thumb: '',
    input: 0,
    output: 1,
    duration: 0,
  }, info);

  createItem(creatorId, name, parentId, ItemInfo.TYPE.SNIPPET, snippetInfo, {}, cb);
};

module.exports = service;
