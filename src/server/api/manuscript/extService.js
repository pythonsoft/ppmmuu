'use strict';

const AttachmentInfo = require('./attachmentInfo');
const config = require('../../config');

const attachmentInfo = new AttachmentInfo();
const service = {};

const TRANSFER_TYPE = {
  CREATE: 'create',
  TRANSFER: 'transfer',
  COMPLETE: 'complete',
  ERROR: 'error',
  STOP: 'stop',
};

service.dealAttachment = function dealAttachment(info) {
  const type = info.type;
  console.log(info.pid, typeof info.pid);
  switch (type) {
    case TRANSFER_TYPE.CREATE:
      service.createAttachment(info);
      break;
    case TRANSFER_TYPE.TRANSFER:
      service.updateAttachment(info, AttachmentInfo.STATUS.UPLOADING);
      break;
    case TRANSFER_TYPE.COMPLETE:
      service.updateAttachment(info, AttachmentInfo.STATUS.COMPLETED);
      break;
    case TRANSFER_TYPE.ERROR:
      service.updateAttachment(info, AttachmentInfo.STATUS.ERROR);
      break;
    case TRANSFER_TYPE.STOP:
      service.updateAttachment(info, AttachmentInfo.STATUS.STOPPING);
      break;
    default:
      break;
  }
};

service.createAttachment = function createAttachment(info) {
  const t = new Date();
  const createInfo = {
    _id: info._id,
    name: info.name,
    progress: '0',
    creator: {
      _id: info.userId,
      name: info.userName,
    },
    status: AttachmentInfo.STATUS.PREPARE,
    createdTime: t,
    modifyTime: t,
    path: '',
    description: '',
    fileInfo: {
      size: info.size,
      name: info.name,
      lastModifiedTime: info.lastModifiedTime,
      path: info.orginalPath || '',
      transfered: 0,
    },
  };

  attachmentInfo.collection.insertOne(createInfo, () => {
    console.log('insert  One==>', createInfo);
  });
};

const getProgress = function getProgress(transfered, total) {
  let rs = '';
  if (transfered >= total) {
    rs = '100';
  } else if (transfered < total && total > 0) {
    rs = `${Math.round((transfered * 100.0) / total)}`;
  } else {
    rs = '100';
  }
  return rs;
};

service.updateAttachment = function updateAttachment(info, status) {
  const t = new Date();
  const updateInfo = {
    status,
    modifyTime: t,
  };

  if (status === AttachmentInfo.STATUS.UPLOADING || status === AttachmentInfo.STATUS.COMPLETED) {
    updateInfo['fileInfo.transfered'] = info.end;
    updateInfo.progress = getProgress(info.end, info.total);
  }

  if (status === AttachmentInfo.STATUS.COMPLETED) {
    updateInfo.path = `${config.imUploadURL}/${info.pid}/${info.name}`;
  }

  attachmentInfo.collection.updateOne({ _id: info.pid }, { $set: updateInfo }, () => {
    console.log('updateInfo==>', updateInfo);
  });
};

module.exports = service;
