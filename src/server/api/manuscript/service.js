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

const ManuscriptInfo = require('./ManuscriptInfo');

const manuscriptInfo = new ManuscriptInfo();

const AttachmentInfo = require('./AttachmentInfo');

const attachmentInfo = new AttachmentInfo();

const service = {};

service.listManuscript = function listManuscript(info, cb) {
  const pageSize = info.pageSize || 15;
  const page = info.page || 1;
  const status = info.status || '';
  const keyword = info.keyword || '';
  const userId = info.userInfo._id;
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
      if (docs[i]['creator._id'] === userId) {
        docs[i].type = ManuscriptInfo.LIST_TYPE.OWNER;
      } else {
        docs[i].type = ManuscriptInfo.LIST_TYPE.COLLABORATOR;
      }
    }
    return cb && cb(null, r);
  });
};

const updateAttachments = function updateAttachments(attachments, manuscriptId, cb) {
  if (attachments.length === 0) {
    return cb && cb(null);
  }

  const attachmentIds = [];
  for (let i = 0, len = attachments.length; i < len; i++) {
    attachmentIds.push(attachments[i]._id);
  }

  const updateInfo = {
    manuscriptId,
    modifyTime: new Date(),
  };

  attachmentInfo.collection.updateMany({ _id: { $in: attachmentIds } }, { $set: updateInfo }, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.addManuscript = function addManuscript(info, cb) {
  manuscriptInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    const attachments = info.attachments || [];
    const manuscriptId = r.insertedId || '';
    updateAttachments(attachments, manuscriptId, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, manuscriptId);
    });
  });
};

const getAttachmentsByManuscriptInfo = function getAttachmentsByManuscriptInfo(info, cb) {
  const attachments = info.attachments || [];
  if (info.attachments.length === 0) {
    return cb && cb(null);
  }

  attachmentInfo.collection.find({ manuscriptId: info._id }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
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

    getAttachmentsByManuscriptInfo(doc, (err, attachments) => {
      if (err) {
        return cb && cb(err);
      }

      doc.attachments = attachments;
      return cb && cb(null, doc);
    });
  });
};

service.updateManuscript = function updateManuscript(info, cb) {
  const _id = info._id || '';
  const status = info.status || '';

  if (!_id) {
    return cb && cb(i18n.t('manuscriptIdIsNull'));
  }

  manuscriptInfo.updateOne({ _id }, info, (err) => {
    if (err) {
      return cb && cb(err);
    }

    const attachments = info.attachments || [];
    updateAttachments(attachments, _id, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      return cb && cb(null, 'ok');
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
      if (doc.name) {
        const attachmentPath = path.join(config.uploadPath, doc.name);
        fs.unlinkSync(attachmentPath);
      }
    });

    attachmentInfo.collection.removeMany(query, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, 'ok');
    });
  });
};

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

  manuscriptInfo.collection.find(query).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!docs || docs.length != _ids.length) {
      return cb && cb(i18n.t('existNotYourManuscript'));
    }

    if (status !== ManuscriptInfo.DELETED) {
      manuscriptInfo.collection.updateMany(query, { $set: { status } }, (err) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, 'ok');
      });
    } else {
      manuscriptInfo.collection.removeMany(query, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        deleteAttachments({ manuscriptId: { $in: _ids } }, (err, r) => cb && cb(err, r));
      });
    }
  });
};

service.createAttachment = function createAttachment(info, cb) {
  const userId = info.creator._id;
  const file = info.fileInfo;
  if (!file) {
    return cb && cb(i18n.t('noFileUpload'));
  }
  info.name = file.filename;
  info.path = `${config.domain}/uploads/${info.name}`;
  attachmentInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, { userId, _id: r.insertedId, name: file.filename });
  });
};

service.deleteAttachmentInfos = function deleteAttachmentInfos(info, cb) {
  let _ids = info._ids || '';
  if (!_ids) {
    return cb && cb(i18n.t('attachmentIdsIsNull'));
  }
  _ids = _ids.split(',');
  const query = { _id: { $in: _ids } };

  deleteAttachments(query, (err, r) => cb && cb(err, r));
};

service.hongKongSimplified = function hongKongSimplified(info, cb) {
  const api = info.conversionType === ManuscriptInfo.CONVERSION_TYPE.HK_TO_SIMPLIFIED ? opencc.hongKongToSimplified : opencc.simplifiedToHongKong;
  if (info.conversionType) {
    delete info.conversionType;
  }
  info = JSON.parse(api(JSON.stringify(info)));

  return cb && cb(null, info);
};


module.exports = service;
