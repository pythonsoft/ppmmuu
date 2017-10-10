/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const utils = require('../../common/utils');
const config = require('../../config');

/**
 * @swagger
 * definitions:
 *   RoleInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       path:
 *         type: string
 *       bucket:
 *          type: object
 *          properties:
 *            _id: string
 *            name: string
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       status:
 *         type: string
 *       maxSize:
 *         type: number
 *       usage:
 *         type: number
 *       triggerLine:
 *         type: number
 *       warningLine:
 *         type: number
 *       minLine:
 *         type: number
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class PathInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'PathInfo', [
      { key: { viceId: 1, 'bucket._id': 1 }, unique: true },
    ]);

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      viceId: { type: 'string', validation: 'require' },     // 副标识
      name: { type: 'string', validation: 'require' },
      webServerPath: { type: 'string' },
      webClientPath: { type: 'string' },
      streamingPath: { type: 'string' },
      ftpPath: { type: 'string' },
      windowsStoragePath: { type: 'string' },
      linuxStoragePath: { type: 'string' },
      reserveCapability: { type: 'number', default: -1 },
      bucket: { type: 'object', default: { _id: '', name: '' }, validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '' }, validation: 'require', allowUpdate: false },
      status: { type: 'string', default: PathInfo.STATUS.NORMAL, validation: v => utils.isValueInObject(v, PathInfo.STATUS) },
      type: { type: 'string', default: PathInfo.TYPE.LOCAL, validation: v => utils.isValueInObject(v, PathInfo.TYPE) },
      maxSize: { type: 'number' },
      usage: { type: 'number' },
      triggerLine: { type: 'number', default: -1 },
      warningLine: { type: 'number', default: -1 },
      minLine: { type: 'number', default: -1 },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }
}

PathInfo.STATUS = {
  NORMAL: '0',
  HAND_UP: '1',
};

PathInfo.TYPE = {
  S3: '0',
  BAIDU_CLOUD: '1',
  ALIYUN: '2',
  LOCAL: '3',
  CIFS: '4',
  NETWORK: '5',
};

module.exports = PathInfo;
