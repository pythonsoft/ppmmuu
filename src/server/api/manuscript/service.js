/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const config = require('../../config');
const path = require('path');
const fs = require('fs');
const opencc = require('node-opencc');
const uuid = require('uuid');
const WebosApi = require('../../common/webosAPI');

const ManuscriptInfo = require('./manuscriptInfo');

const manuscriptInfo = new ManuscriptInfo();

const AttachmentInfo = require('./attachmentInfo');

const attachmentInfo = new AttachmentInfo();

const ManuscriptHistoryInfo = require('./manuscriptHistoryInfo');

const manuscriptHistoryInfo = new ManuscriptHistoryInfo();

const GroupInfo = require('../group/groupInfo');

const configService = require('../configuration/service');

const groupService = require('../group/service');

const groupUserService = require('../group/userService');

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const service = {};

service.listManuscript = function listManuscript(info, cb) {
  const pageSize = info.pageSize || 15;
  const page = info.page || 1;
  const status = info.status || '';
  const keyword = info.keyword || '';
  const userId = info.userInfo._id;
  const fieldsNeed = info.fieldsNeed || '';
  const sortFields = info.sortFields || '-modifyTime';
  const q = {};
  const query = { $or: [
    { 'creator._id': userId },
    { collaborators: { $elemMatch: { _id: userId } } },
  ] };

  if (status) {
    q.status = status;
  }

  if (keyword) {
    const keywordQuery = {
      $or: [
        { title: { $regex: keyword, $options: 'i' } },
        { viceTitle: { $regex: keyword, $options: 'i' } },
        { content: { $regex: keyword, $options: 'i' } },
      ],
    };
    q.$and = [
      query,
      keywordQuery,
    ];
  } else {
    q.$or = query.$or;
  }

  manuscriptInfo.pagination(q, page, pageSize, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const docs = r.docs || [];
    for (let i = 0, len = docs.length; i < len; i++) {
      if (docs[i].creator._id === userId) {
        docs[i].createType = ManuscriptInfo.LIST_TYPE.OWNER;
      } else {
        docs[i].createType = ManuscriptInfo.LIST_TYPE.COLLABORATOR;
      }
    }
    if (keyword) {
      service.saveSearch(keyword, userId, () => {});
    }
    return cb && cb(null, r);
  }, sortFields, fieldsNeed);
};

const updateAttachments = function updateAttachments(attachments, manuscriptId, cb) {
  if (attachments.length === 0) {
    return cb && cb(null);
  }

  const attachmentIds = [];
  for (let i = 0, len = attachments.length; i < len; i++) {
    attachmentIds.push(attachments[i].attachmentId);
  }

  const updateInfo = {
    manuscriptId,
    modifyTime: new Date(),
  };

  attachmentInfo.collection.updateMany({ _id: { $in: attachmentIds } }, { $set: updateInfo }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.addOrUpdateManuscript = function addOrUpdateManuscript(info, cb) {
  if (info._id) {
    service.updateManuscript(info, cb);
  } else {
    service.addManuscript(info, cb);
  }
};

service.addManuscript = function addManuscript(info, cb) {
  if (info.editContent && utils.getValueType(info.editContent) === 'array') {
    const editContent = info.editContent;
    info.editContent = editContent.map(item => ({
      tag: item.tag,
      content: item.content,
      modifyTime: new Date(),
    }));
  }

  if (info.attachments && utils.getValueType(info.attachments) === 'array') {
    for (let i = 0, len = info.attachments.length; i < len; i++) {
      const item = info.attachments[i];
      if (!item.userId || !item.attachmentId || !item.name) {
        return cb && cb(i18n.t('invalidParameterAttachments'));
      }
    }
  }

  info._id = uuid.v1();
  manuscriptInfo.insertOne(info, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const attachments = info.attachments || [];
    const manuscriptId = info._id;
    updateAttachments(attachments, manuscriptId, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, info._id);
    });
  });
};

const getAttachmentsByManuscriptInfo = function getAttachmentsByManuscriptInfo(info, cb) {
  const attachments = info.attachments || [];
  if (attachments.length === 0) {
    return cb && cb(null, attachments);
  }

  attachmentInfo.collection.find({ manuscriptId: info._id }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getSummary = function getStatusCount(info, cb) {
  manuscriptInfo.collection.aggregate([
    {
      $match: {
        'creator._id': info.creator._id,
        status: { $in: ManuscriptInfo.STATUS_VALS },
      },
    },
    {
      $group: {
        _id: '$status',
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ], (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const rs = {
      total: ManuscriptInfo.STATUS_VALS.length,
      summary: {},
    };
    for (const key in ManuscriptInfo.STATUS_MAP) {
      rs.summary[key] = {
        _id: key,
        status: key,
        name: ManuscriptInfo.STATUS_MAP[key],
        count: 0,
      };
    }
    for (let j = 0, len1 = r.length; j < len1; j++) {
      rs.summary[r[j]._id].count = r[j].count;
    }
    return cb && cb(null, rs);
  });
};

service.getManuscript = function getManuscript(info, cb) {
  const _id = info._id || '';
  if (!_id) {
    return cb && cb(i18n.t('manuscriptIdIsNull'));
  }

  manuscriptInfo.collection.findOne({ _id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('cannotFindManuscript'));
    }
    return cb && cb(null, doc);
  });
};

service.updateManuscript = function updateManuscript(info, cb) {
  const _id = info._id || '';

  if (!_id) {
    return cb && cb(i18n.t('manuscriptIdIsNull'));
  }

  if (info.editContent && utils.getValueType(info.editContent) === 'array') {
    const editContent = info.editContent;
    info.editContent = editContent.map(item => ({
      tag: item.tag,
      content: item.content,
      modifyTime: new Date(),
    }));
  }

  info.modifyTime = new Date();

  if (info.attachments && utils.getValueType(info.attachments) === 'array') {
    for (let i = 0, len = info.attachments.length; i < len; i++) {
      const item = info.attachments[i];
      if (!item.userId || !item.attachmentId || !item.name) {
        return cb && cb(i18n.t('invalidParameterAttachments'));
      }
    }
  }

  manuscriptInfo.updateOne({ _id }, info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    const attachments = info.attachments || [];
    updateAttachments(attachments, _id, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, _id);
    });
  });
};

const deleteAttachments = function deleteAttachments(query, cb) {
  attachmentInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    // 删除磁盘上的附件
    docs.forEach((doc) => {
      if (doc.fileInfo && doc.fileInfo.filename) {
        const attachmentPath = path.join(config.uploadPath, doc.fileInfo.filename);
        if (fs.existsSync(attachmentPath)) {
          fs.unlinkSync(attachmentPath);
        }
      }
    });

    attachmentInfo.collection.removeMany(query, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

function getMappedUserId(webosTicket, cb) {
  const wos = new WebosApi(config.WEBOS_SERVER);
  wos.getMappedUserId(webosTicket, config.DAYANG_ID, (err, rs) => {
    if (err) {
      return cb && cb(i18n.t('getMappedUserIdFailed', { error: err }));
    }
    if (rs) {
      return cb && cb(null, rs.UserId);
    }
    return cb && cb(i18n.t('noMappedUserId'));
  });
}


function submitDaYang(info, cb) {
  const params = {
    collaborators: [],
    scriptDetail: {},
    attachments: [],
    submissionTarget: info.submissionTarget,
    mappedUserId: '',
    user: {},
    source: {
      id: '',
      client: '',
    },
  };

  params.user = {
    id: info.creator.email,
    name: info.creator.name,
  };

  params.source = {
    id: info._id,
    client: info.platform,
  };

  params.scriptDetail = utils.merge({
    title: '',
    subtitle: '',
    source: '',
    importance: '',
    type: '',
  }, info);
  params.scriptDetail.importance = info.important;
  params.scriptDetail.remark = info.description;
  params.scriptDetail.scriptType = info.contentType;
  if (info.editContent && info.editContent.length) {
    params.scriptDetail.content = info.editContent[0].content;
  }


  function getCollborators(callback) {
    const collaborators = [];
    if (info.collaborators && info.collaborators.length) {
      const userIds = [];
      info.collaborators.forEach((item) => {
        userIds.push(item._id);
      });
      userInfo.collection.find({ _id: { $in: userIds } }).toArray((err, users) => {
        if (err) {
          logger.error(err.message);
          return callback && callback(i18n.t('databaseError'));
        }
        if (users && users.length) {
          users.forEach((item) => {
            collaborators.push({
              Id: item.email,
              Name: item.name,
            });
          });
        }
        return callback(null, collaborators);
      });
    } else {
      return callback(null, collaborators);
    }
  }

  function getAttachments(callback) {
    const attachments = [];
    if (info.attachments && info.attachments.length) {
      const attachmentIds = [];
      info.attachments.forEach((item) => {
        attachmentIds.push(item.attachmentId);
      });
      attachmentInfo.collection.find({ _id: { $in: attachmentIds } }).toArray((err, attachmentInfos) => {
        if (err) {
          logger.error(err.message);
          return callback && callback(i18n.t('databaseError'));
        }
        if (attachmentInfos && attachmentInfos.length) {
          attachmentInfos.forEach((item) => {
            attachments.push({
              Id: item._id,
              Filename: item.name,
              Path: item.fileInfo.path || item.path,
            });
          });
        }
        return callback(null, attachments);
      });
    } else {
      return callback(null, attachments);
    }
  }

  getCollborators((err, collaborators) => {
    if (err) {
      return cb && cb(err);
    }
    params.collaborators = collaborators;
    getAttachments((err, attachments) => {
      if (err) {
        return cb && cb(err);
      }
      params.attachments = attachments;
      getMappedUserId(info.creator.webosTicket, (err, mappedUserId) => {
        if (err) {
          return cb && cb(err);
        }
        params.mappedUserId = mappedUserId;
        utils.requestCallApi(`${config.hongkongUrl}submit_script`, 'POST', params, '', (err, rs) => {
          if (err) {
            return cb && cb(null, err);
          }
          if (rs.status === 0) {
            return cb && cb(null, 'ok');
          }

          return cb && cb(i18n.t('submitScriptToDaYangError', { error: rs.result.errorMsg }));
        });
      });
    });
  });
}

service.changeManuscriptStatus = function changeManuscriptStatus(info, cb) {
  let _ids = info._ids || '';
  const status = info.status || '';
  if (!_ids) {
    return cb && cb(i18n.t('manuscriptIdsIsNull'));
  }
  _ids = _ids.split(',');
  const query = {
    _id: { $in: _ids },
    'creator._id': info.creator._id,
  };
  delete info._ids;

  manuscriptInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length !== _ids.length) {
      return cb && cb(i18n.t('existNotYourManuscript'));
    }

    if (status !== ManuscriptInfo.DELETED) {
      const rs = manuscriptInfo.updateAssign(info);
      if (rs.err) {
        return cb && cb(rs.err);
      }
      const updateInfo = rs.doc;
      updateInfo.modifyTime = new Date();

      if (status === ManuscriptInfo.STATUS.SUBMITTED) {
        docs[0].creator = info.creator;
        docs[0].platform = info.platform;
        docs[0].submissionTarget = ManuscriptInfo.SUBMISSION_TARGET.DAYANG;
        submitDaYang(docs[0], (err) => {
          if (err) {
            return cb && cb(err);
          }
          manuscriptInfo.collection.updateMany(query, { $set: updateInfo }, (err) => {
            if (err) {
              return cb && cb(err);
            }

            return cb && cb(null, 'ok');
          });
        });
      } else {
        manuscriptInfo.collection.updateMany(query, { $set: updateInfo }, (err) => {
          if (err) {
            return cb && cb(err);
          }
          return cb && cb(null, 'ok');
        });
      }
    } else {
      for (let i = 0, len = docs.length; i < len; i++) {
        if (docs[i].status !== ManuscriptInfo.STATUS.DUSTBIN) {
          return cb && cb(i18n.t('existNotDustbin'));
        }
      }

      manuscriptInfo.collection.removeMany(query, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        deleteAttachments({ manuscriptId: { $in: _ids } }, (err, r) => cb && cb(err, r));
      });
    }
  });
};

service.clearAll = function clearAll(info, cb) {
  const query = {
    'creator._id': info.creator._id,
    status: ManuscriptInfo.STATUS.DUSTBIN,
  };
  manuscriptInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    const _ids = [];
    if (!docs || docs.length === 0) {
      return cb && cb(i18n.t('dustbinHasBeenCleared'));
    }

    docs.forEach((item) => {
      _ids.push(item._id);
    });

    manuscriptInfo.collection.removeMany(query, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      deleteAttachments({ manuscriptId: { $in: _ids } }, (err, r) => cb && cb(err, r));
    });
  });
};

service.createAttachment = function createAttachment(info, cb) {
  const userId = info.creator._id;
  const file = info.fileInfo;
  if (!file) {
    return cb && cb(i18n.t('noFileUpload'));
  }
  info.name = file.originalname;
  info.path = `${config.domain}/uploads/${file.filename}`;
  info._id = uuid.v1();
  attachmentInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, { userId, _id: r.insertedId, name: info.name });
  });
};

service.bindAttachment = function bindAttachment(info, cb) {
  const userId = info.creator._id;
  const manuscriptId = info.manuscriptId || '';
  const attachmentId = info.attachmentId || '';

  const struct = {
    manuscriptId: { type: 'string', validation: 'require' },
    attachmentId: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  manuscriptInfo.collection.findOne({ _id: manuscriptId }, (err, manu) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!manu) {
      return cb && cb(i18n.t('cannotFindManuscript'));
    }
    const attachments = manu.attachments || [];

    attachmentInfo.collection.findOne({ _id: attachmentId }, (err, atta) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!atta) {
        return cb && cb(i18n.t('canNotFindAttachment'));
      }

      for (let i = 0, len = attachments.length; i < len; i++) {
        if (attachments[i].attachmentId === attachmentId) {
          return cb && cb(null, 'ok');
        }
      }

      const item = {
        userId,
        attachmentId,
        name: atta.name,
      };
      attachments.push(item);

      const updateInfo = {
        attachments,
        modifyTime: new Date(),
      };

      manuscriptInfo.updateOne({ _id: manuscriptId }, updateInfo, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        const updateInfo = {
          manuscriptId,
          modifyTime: new Date(),
        };
        attachmentInfo.updateOne({ _id: attachmentId }, updateInfo, (err) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, 'ok');
        });
      });
    });
  });
};

service.deleteAttachmentInfos = function deleteAttachmentInfos(info, cb) {
  let _ids = info._ids || '';
  if (!_ids) {
    return cb && cb(i18n.t('attachmentIdsIsNull'));
  }
  _ids = _ids.split(',');
  const query = { _id: { $in: _ids } };

  attachmentInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    // 删除磁盘上的附件
    docs.forEach((doc) => {
      if (doc.fileInfo && doc.fileInfo.filename) {
        const attachmentPath = path.join(config.uploadPath, doc.fileInfo.filename);
        if (fs.existsSync(attachmentPath)) {
          fs.unlinkSync(attachmentPath);
        }
      }
    });

    if (docs && docs.length) {
      const manuscriptId = docs[0].manuscriptId || '';
      manuscriptInfo.collection.findOne({ _id: manuscriptId }, (err, ma) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        if (!ma) {
          attachmentInfo.collection.removeMany(query, (err) => {
            if (err) {
              logger.error(err.message);
              return cb && cb(i18n.t('databaseError'));
            }

            return cb && cb(null, 'ok');
          });
        } else {
          const attachments = ma.attachments;
          for (let i = attachments.length - 1; i >= 0; i--) {
            const _id = attachments[i].attachmentId;
            if (_ids.indexOf(_id) !== -1) {
              attachments.splice(i, 1);
            }
          }
          manuscriptInfo.collection.updateOne({ _id: manuscriptId }, { $set: { attachments } }, (err) => {
            if (err) {
              logger.error(err.message);
              return cb && cb(i18n.t('databaseError'));
            }

            attachmentInfo.collection.removeMany(query, (err) => {
              if (err) {
                logger.error(err.message);
                return cb && cb(i18n.t('databaseError'));
              }

              return cb && cb(null, 'ok');
            });
          });
        }
      });
    } else {
      return cb && cb(null, 'ok');
    }
  });
};

service.listAttachments = function listAttachments(info, cb) {
  const pageSize = info.pageSize || 15;
  const page = info.page || 1;
  const keyword = info.keyword || '';
  const manuscriptId = info.manuscriptId || '';
  const fieldsNeed = info.fieldsNeed || '';
  const sortFields = info.sortFields || '-createdTime';
  const q = {};

  if (manuscriptId) {
    q.manuscriptId = manuscriptId;
  }

  if (keyword) {
    q.name = { name: { $regex: keyword, $options: 'i' } };
  }

  attachmentInfo.pagination(q, page, pageSize, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  }, sortFields, fieldsNeed);
};

service.hongKongSimplified = function hongKongSimplified(info, cb) {
  const api = info.conversionType === ManuscriptInfo.CONVERSION_TYPE.HK_TO_SIMPLIFIED ? opencc.hongKongToSimplified : opencc.simplifiedToHongKong;
  if (info.conversionType) {
    delete info.conversionType;
  }
  info = JSON.parse(api(JSON.stringify(info)));

  return cb && cb(null, info);
};

service.getTagsConfig = function getTagsConfig(cb) {
  const query = { key: 'manuscriptTags' };
  configService.getConfig(query, cb);
};

service.getManuscriptConfig = function getManuscriptConfig(cb) {
  const query = { key: 'manuscriptInfoConfig' };
  configService.getConfig(query, cb);
};

service.listGroup = function listGroup(info, cb) {
  let parentId = info.parentId || '';
  const type = info.type || '';
  const page = info.page || 1;
  const pageSize = info.pageSize || 999;
  let _id = '';

  if (type === GroupInfo.TYPE.COMPANY) {
    _id = info.userInfo.company._id;
  } else if (type === GroupInfo.TYPE.DEPARTMENT && !parentId) {
    parentId = info.userInfo.company._id;
  } else if (!parentId) {
    return cb && cb(i18n.t('groupParentIdIsNull'));
  }
  groupService.listGroup(parentId, type, page, pageSize, cb, _id);
};

service.getGroupUserList = function getGroupUserList(info, cb) {
  groupUserService.getGroupUserList(info, cb);
};

service.saveSearch = function saveSearch(k, id, cb) {
  manuscriptHistoryInfo.findOneAndUpdate({ keyword: k, userId: id },
      { $set: { updatedTime: new Date() }, $inc: { count: 1 }, $setOnInsert: { _id: uuid.v1() } },
      { returnOriginal: false, upsert: true },
      (err, r) => cb && cb(err, r));
};

service.getSearchHistoryForManuscript = (info, cb) => {
  const userId = info.creator._id;
  let pageSize = info.pageSize || 10;
  pageSize *= 1;
  manuscriptHistoryInfo.collection
      .find({ userId })
      .sort({ updatedTime: -1 })
      .limit(pageSize).project({
        keyword: 1,
        updatedTime: 1,
        count: 1,
      })
      .toArray((err, docs) => cb && cb(err, docs));
};

service.clearSearchHistory = function clearSearchHistory(info, cb) {
  const userId = info.creator._id;
  manuscriptHistoryInfo.collection.removeMany({ userId }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.copy = function copy(info, cb) {
  const status = info.status;
  const _id = info._id;

  const struct = {
    _id: { type: 'string', validation: 'require' },
    status: { type: 'string', validation: v => utils.isValueInObject(v, ManuscriptInfo.TYPE) },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  manuscriptInfo.collection.findOne({ _id, 'creator._id': info.creator._id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('canNotFindYourManuscript'));
    }

    const t = new Date();
    const attachments = doc.attachments;
    doc.attachments = [];
    delete doc._id;
    doc.createdTime = t;
    doc.modifyTime = t;
    doc.status = status;

    service.addOrUpdateManuscript(doc, (err, manuscriptId) => {
      if (err) {
        return cb && cb(err);
      }

      if (!attachments || attachments.length === 0) {
        return cb && cb(null, 'ok');
      }

      const newAttachments = [];

      const copyAttachments = function copyAttachments(index, callback) {
        if (index >= attachments.length) {
          return callback && callback(null, newAttachments);
        }

        const item = attachments[index];

        attachmentInfo.collection.findOne({ _id: item.attachmentId }, (err, doc) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          if (!doc) {
            copyAttachments(index + 1, callback);
          } else {
            delete doc._id;
            doc._id = uuid.v1();
            doc.manuscriptId = manuscriptId;
            attachmentInfo.collection.insertOne(doc, (err) => {
              if (err) {
                logger.error(err.message);
                return cb && cb(i18n.t('databaseError'));
              }
              item.attachmentId = doc._id;
              newAttachments.push(item);
              copyAttachments(index + 1, callback);
            });
          }
        });
      };

      copyAttachments(0, (err, newAttachments) => {
        if (err) {
          return cb && cb(err);
        }

        const updateInfo = { attachments: newAttachments };
        manuscriptInfo.collection.updateOne({ _id: manuscriptId }, { $set: updateInfo }, (err) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, 'ok');
        });
      });
    });
  });
};

service.createWebSocketTask = function createWebSocketTask(info, cb) {
  const templateInfo = {
    progress: '0',
    status: AttachmentInfo.STATUS.ready,
    createdTime: new Date(),
    modifyTime: new Date(),
  };
  info = Object.assign({}, templateInfo, info);
  attachmentInfo.insertOne(info, cb);
};

service.updateWebSocketTask = function updateWebSocketTask(info, cb) {
  const struct = {
    _id: { type: 'string', validation: 'require' },
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }
  attachmentInfo.updateOne({ _id: info._id }, info, cb);
};

service.listSubmitScript = function listSubmitScript(info, cb) {
  let pageSize = info.pageSize || 15;
  let page = info.page || 1;
  let status = info.status || '';
  const keyword = info.keyword || '';
  const userId = info.userInfo.email;
  const sort = info.sort || 1;
  const params = {};

  if (status) {
    status *= 1;
    params.status = status;
  }
  if (keyword) {
    params.keyword = keyword;
  }

  pageSize *= 1;
  page *= 1;
  params.by = sort * 1;
  params.pageSize = pageSize * 1;
  params.currentPage = page * 1;
  params.userId = userId;

  const formatDocs = function formatDocs(docs, userId) {
    const newDocs = [];
    if (docs && docs.length) {
      for (let i = 0, len = docs.length; i < len; i++) {
        const item = {};
        item._id = docs[i].source.Id;
        item.title = docs[i].ScriptDetail.Title;
        item.viceTitle = docs[i].ScriptDetail.Subtitle;
        item.attachments = docs[i].Attachments;
        item.status = docs[i].status;
        item.createdTime = docs[i].CreatedTime;
        item.modifyTime = docs[i].ModifiedTime || item.createdTime;
        if (docs[i].User.Id === userId) {
          item.createType = ManuscriptInfo.LIST_TYPE.OWNER;
        } else {
          item.createType = ManuscriptInfo.LIST_TYPE.COLLABORATOR;
        }
        newDocs.push(item);
      }
    }
    return newDocs;
  };

  utils.requestCallApi(`${config.hongkongUrl}list_script`, 'POST', params, '', (err, rs) => {
    if (keyword) {
      service.saveSearch(keyword, userId, () => {});
    }
    if (err) {
      return cb && cb(null, err);
    }
    if (rs.status === 0) {
      const docs = formatDocs(rs.result.items);
      const total = rs.result.total * 1;
      const list = {
        page,
        docs,
        pageSize,
        pageCount: Math.ceil(total / pageSize),
        total,
      };
      return cb && cb(null, list);
    }

    return cb && cb(i18n.t('listSubmitScriptError:', { error: rs.result.errorMsg }));
  });
};

module.exports = service;
