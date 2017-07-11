/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
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
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       status:
 *         type: string
 *       protocol:
 *         type: string
 *       permission:
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
    super(config.dbInstance.umpDB, 'PathInfo');

    this.doc = {
      _id: '',
      name: '',
      path: '',
      storage: {
        _id: '',
        name: '',
      },
      creator: { _id: '', name: '' },
      status: PathInfo.STATUS.NORMAL,
      type: PathInfo.TYPE.LOCAL,
      maxSize: 0,
      usage: 0,
      triggerLine: -1,
      warningLine: -1,
      minLine: -1,
      createdTime: new Date(),
      modifyTime: new Date(),
      description: '',
      detail: {},
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
