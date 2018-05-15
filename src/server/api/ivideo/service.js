/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const uuid = require('uuid');
const config = require('../../config');

const ProjectInfo = require('./projectInfo');

const projectInfo = new ProjectInfo();

const ItemInfo = require('./itemInfo');

const itemInfo = new ItemInfo();

const workflowService = require('../workflow/service');

const service = {};

const createSnippetOrDirItem = function createSnippetOrDirItem(creatorId, ownerType, name, parentId, type = ItemInfo.TYPE.DIRECTORY, canRemove = ItemInfo.CAN_REVMOE.YES, snippet = {}, details = {}, cb, creator) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  if (!name) {
    return cb && cb(i18n.t('ivideoItemNameIsNull'));
  }

  if (!parentId) {
    return cb && cb(i18n.t('ivideoParentIdIsNull'));
  }

  const info = { _id: uuid.v1(), name, creatorId, parentId, type, snippet, details, canRemove, ownerType };
  if (creator) {
    info.creator = creator;
  }

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

      createSnippetOrDirItem(creatorId, ItemInfo.OWNER_TYPE.MINE, i18n.t('ivideoItemDefaultName').message, doc._id, ItemInfo.TYPE.DEFAULT_DIRECTORY, ItemInfo.CAN_REVMOE.NO, {}, {}, err => cb && cb(err, doc, isNew));
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

service.listItem = function listItem(creatorId, parentId, ownerType, type, cb, sortFields, fieldsNeed) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  const query = {};

  if (!parentId) {
    query.parentId = '';
  } else {
    if (!utils.isValueInObject(ownerType, ItemInfo.OWNER_TYPE)) {
      return cb && cb(i18n.t('ivideoProjectOwnerTypeIsInvalid'));
    }
    query.parentId = parentId;
    if (ownerType === ItemInfo.OWNER_TYPE.MINE) {
      query.creatorId = creatorId;
    }
  }

  if (type) {
    if (type.indexOf(',') !== -1) {
      query.type = { $in: type.split(',') };
    } else {
      query.type = type;
    }
  }

  if (!parentId || ownerType === ItemInfo.OWNER_TYPE.MINE || ownerType === ItemInfo.OWNER_TYPE.SHARE) {
    let cursor = itemInfo.collection.find(query);

    cursor.sort(utils.formatSortOrFieldsParams(sortFields, true));

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
  } else if (ownerType === ItemInfo.OWNER_TYPE.SHOULU) {
    return cb && cb(null, []);
  } else if (ownerType === ItemInfo.OWNER_TYPE.NEWS) {
    return cb && cb(null, []);
  }
};

service.createDirectory = function createDirectory(creatorId, ownerType, name, parentId, details, creator, cb) {
  if (!creatorId) {
    return cb && cb(i18n.t('ivideoProjectCreatorIdIsNull'));
  }

  if (!name) {
    return cb && cb(i18n.t('ivideoItemNameIsNull'));
  }

  const type = ItemInfo.TYPE.DIRECTORY;
  const snippet = {};
  const canRemove = ItemInfo.CAN_REVMOE.YES;
  const getParentIdAndOwnerType = function getParentIdAndOwnerType(callback) {
    if (!parentId && !ownerType) {
      itemInfo.collection.findOne({ name: '我的素材', parentId: '' }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(i18n.t('ivideoProjectCannotFindMyMaterial'));
        }

        parentId = doc._id;
        ownerType = ItemInfo.OWNER_TYPE.MINE;
        return callback && callback(null);
      });
    } else {
      if (!parentId) {
        return cb && cb(i18n.t('ivideoParentIdIsNull'));
      }
      if (ItemInfo.OWNER_TYPE.SHARE !== ownerType && ItemInfo.OWNER_TYPE.MINE !== ownerType) {
        return cb && cb(i18n.t('ivideoProjectOwnerTypeIsInvalid'));
      }
      return callback && callback(null);
    }
  };

  getParentIdAndOwnerType(() => {
    const info = { _id: uuid.v1(), name, creatorId, creator, parentId, type, snippet, details, canRemove, ownerType };
    if (creator) {
      info.creator = creator;
    }
    itemInfo.insertOne(info, (err, r, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r, doc._id);
    });
  });
};

service.createItem = function createItem(creatorId, ownerType, name, parentId, snippet, details, creator, cb) {
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
        fileTypeId: '',
        fromWhere: '',
      }, info);
    } else {
      snippetInfo = snippet;
    }
  }

  const getParentIdAndOwnerType = function getParentIdAndOwnerType(callback) {
    if (!parentId && !ownerType) {
      itemInfo.collection.findOne({ name: '我的素材', parentId: '' }, (err, doc) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!doc) {
          return cb && cb(i18n.t('ivideoProjectCannotFindMyMaterial'));
        }

        parentId = doc._id;
        ownerType = ItemInfo.OWNER_TYPE.MINE;
        return callback && callback(null);
      });
    } else {
      if (!parentId) {
        return cb && cb(i18n.t('ivideoParentIdIsNull'));
      }
      if (ItemInfo.OWNER_TYPE.SHARE !== ownerType && ItemInfo.OWNER_TYPE.MINE !== ownerType) {
        return cb && cb(i18n.t('ivideoProjectOwnerTypeIsInvalid'));
      }
      return callback && callback(null);
    }
  };

  getParentIdAndOwnerType(() => {
    const type = ItemInfo.TYPE.SNIPPET;
    const canRemove = ItemInfo.CAN_REVMOE.YES;
    const info = { _id: uuid.v1(), name, creatorId, creator, parentId, type, snippet: snippetInfo, details, canRemove, ownerType };
    if (creator) {
      info.creator = creator;
    }
    itemInfo.insertOne(info, (err, r, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r, doc._id);
    });
  });
};

service.removeItem = function removeItem(id, ownerType, cb) {
  if (!id) {
    return cb && cb(i18n.t('ivideoRemoveItemIdIsNull'));
  }
  if (ItemInfo.OWNER_TYPE.SHARE !== ownerType && ItemInfo.OWNER_TYPE.MINE !== ownerType) {
    return cb && cb(i18n.t('ivideoProjectOwnerTypeIsInvalid'));
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

service.updateItem = function updateItem(id, name, details, ownerType, cb) {
  if (!id) {
    return cb && cb(i18n.t('ivideoRemoveItemIdIsNull'));
  }

  const update = {};

  update.modifyTime = new Date();

  if (ItemInfo.OWNER_TYPE.SHARE !== ownerType && ItemInfo.OWNER_TYPE.MINE !== ownerType) {
    return cb && cb(i18n.t('ivideoProjectOwnerTypeIsInvalid'));
  }

  if (name) {
    update.name = name;
  }

  if (details) {
    update.details = details;
  }

  if (utils.isEmptyObject(update)) {
    return cb && cb(null, 'ok');
  }
  itemInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('ivideoProjectCannotFindItem'));
    }
    if (!doc.parentId) {
      return cb && cb(i18n.t('ivideoProjectCannotUpdateItem'));
    }

    itemInfo.updateOne({ _id: id }, update, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
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

service.copy = function copy(info, needDelete = false, cb) {
  let srcIds = info.srcIds || '';
  const destId = info.destId || '';
  const creatorId = info.creatorId || '';
  const creator = info.creator || '';
  const srcOwnerType = info.srcOwnerType || '';
  const destOwnerType = info.destOwnerType || '';
  if (needDelete) {
    if (ItemInfo.OWNER_TYPE.SHARE !== srcOwnerType && ItemInfo.OWNER_TYPE.MINE !== srcOwnerType) {
      return cb && cb(i18n.t('ivideoProjectSrcOwnerTypeIsInvalid'));
    }
  }
  if (ItemInfo.OWNER_TYPE.SHARE !== destOwnerType && ItemInfo.OWNER_TYPE.MINE !== destOwnerType) {
    return cb && cb(i18n.t('ivideoProjectDestOwnerTypeIsInvalid'));
  }
  if (!srcIds) {
    return cb && cb(i18n.t('ivideoProjectSrcIdsIsNull'));
  }

  if (!destId) {
    return cb && cb(i18n.t('ivideoProjectDestIdIsNull'));
  }

  srcIds = srcIds.split(',');

  if (srcOwnerType === ItemInfo.OWNER_TYPE) {
    itemInfo.collection.findOne({ _id: destId }, (err, dest) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!dest) {
        return cb && cb(i18n.t('ivideoProjectCopyDestinationNotFound'));
      }

      const copyInfos = [];
      const newIds = {};
      const allIds = [];
      itemInfo.collection.find({ _id: { $in: srcIds } }).toArray((err, docs) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }
        if (!docs || !docs.length) {
          return cb && cb(i18n.t('ivideoProjectCopySourceNotFound'));
        }
        for (let i = 0, len = docs.length; i < len; i++) {
          if (docs[i].type === ItemInfo.TYPE.DEFAULT_DIRECTORY || docs[i].canRemove === ItemInfo.CAN_REVMOE.NO) {
            return cb && cb(i18n.t('ivideoProjectCannotCopyOrMove'));
          }
          newIds[docs[i].parentId] = dest._id;
        }
        const loopGetChildren = function loopGetChildren(docs) {
          if (!docs || !docs.length) {
            itemInfo.collection.insertMany(copyInfos, (err) => {
              if (err) {
             logger.error(err.message);
             return cb && cb(i18n.t('databaseError'));
           }
              if (!needDelete) {
             return cb && cb(null, 'ok');
           }
              itemInfo.collection.removeMany({ _id: { $in: allIds } }, (err) => {
             if (err) {
                logger.error(err.message);
                return cb && cb(i18n.t('databaseError'));
              }
             return cb && cb(null, 'ok');
           });
            });
          } else {
            const ids = [];
            const cloneDocs = JSON.parse(JSON.stringify(docs));
            for (let i = 0, len = docs.length; i < len; i++) {
              allIds.push(docs[i]._id);
              ids.push(docs[i]._id);
              const newId = uuid.v1();
              cloneDocs[i]._id = newId;
              cloneDocs[i].parentId = newIds[cloneDocs[i].parentId];
              cloneDocs[i].ownerType = dest.ownerType;
              newIds[docs[i]._id] = newId;
              cloneDocs[i].createdTime = new Date();
              cloneDocs[i].modifyTime = new Date();
              cloneDocs[i].creatorId = creatorId;
              cloneDocs[i].creator = creator;
              copyInfos.push(cloneDocs[i]);
            }
            itemInfo.collection.find({ parentId: { $in: ids } }).toArray((err, docs) => {
              if (err) {
             logger.error(err.message);
             return cb && cb(i18n.t('databaseError'));
           }
              loopGetChildren(docs);
            });
          }
        };
        loopGetChildren(docs);
      });
    });
  }
};


// 快编入库并上架
service.warehouse = function warehouse(info, cb) {
  const struct = {
    workflowId: { type: 'string', validation: 'require' },
    parms: { type: 'object', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  info.priority = info.priority || 0;
  info.name = 'Edit_Import_Shelve';

  console.log(JSON.stringify(info));
  workflowService.instanceCreate(info.name, info.workflowId, info.parms, info.priority, (err, rs) => {
    if (err) {
      return cb && cb(i18n.t('instanceResponseError', { error: err }));
    }
    return cb && cb(null, 'ok');
  });
};

module.exports = service;
