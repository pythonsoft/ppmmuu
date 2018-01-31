/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');
const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   QRCodeInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 *       creator:
 *         type: object
 *         properties:
 *           _id: string
 *           name: string
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class QRCodeInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'QRCodeInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      isConfirm: { type: 'string', default: QRCodeInfo.IS_CONFIRM.NO, validation: v => utils.isValueInObject(v, QRCodeInfo.IS_CONFIRM) }, // 是否已访问过
      expiredTime: { type: 'date', validation: 'require', allowUpdate: false }, // 过期时间
      ticket: { type: 'string' },
      createdTime: { type: 'date', allowUpdate: false },
      scanTime: { type: 'date' }, // 扫码时间
      code: { type: 'string' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

QRCodeInfo.IS_CONFIRM = {
  YES: '1',
  NO: '0',
};

module.exports = QRCodeInfo;
