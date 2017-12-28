/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class AttachmentInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ManuscriptAttachmentInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      manuscriptId: { type: 'string' },
      name: { type: 'string' },
      type: { type: 'string' },
      fileInfo: {
        type: 'object',
      },
      progress: {
        type: 'string',
      },
      path: {
        type: 'string',
      },
      speed: {
        type: 'string',
      },
      creator: { type: 'object', default: { _id: '', name: '' } },
      status: { type: 'string', default: AttachmentInfo.STATUS.ready, validation: v => utils.isValueInObject(v, AttachmentInfo.STATUS) },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
    };
  }

}

AttachmentInfo.STATUS = {
  ready: '1',
  start: '2',
  transfer: '3',
  transferSuccess: '4',
  composeStart: '5',
  compose: '6',
  composeSuccess: '7',
  composeError: '8',
  removePackagePartStart: '9',
  removePackagePart: '10',
  removePackageSuccess: '11',
  removePackageError: '12',
  stop: '13',
  success: '999',
  error: '1000',
};

module.exports = AttachmentInfo;
