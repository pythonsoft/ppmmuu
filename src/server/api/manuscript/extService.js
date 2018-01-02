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
      service.updateAttachment(info, AttachmentInfo.STATUS.transfer);
      break;
    case TRANSFER_TYPE.COMPLETE:
      service.updateAttachment(info, AttachmentInfo.STATUS.success);
      break;
    case TRANSFER_TYPE.ERROR:
      service.updateAttachment(info, AttachmentInfo.STATUS.error);
      break;
    case TRANSFER_TYPE.STOP:
      service.updateAttachment(info, AttachmentInfo.STATUS.stop);
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
    status: AttachmentInfo.STATUS.ready,
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

  attachmentInfo.insertOne(createInfo, () => {
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

  if (status === AttachmentInfo.STATUS.transfer || status === AttachmentInfo.STATUS.success) {
    updateInfo['fileInfo.transfered'] = info.end;
    updateInfo.progress = getProgress(info.end, info.total);
  }

  if (status === AttachmentInfo.STATUS.success) {
    updateInfo.speed = info.speed || '';
  }

  attachmentInfo.updateOne({ _id: info.pid }, updateInfo, () => {
    console.log('updateInfo==>', updateInfo);
  });
};

module.exports = service;
