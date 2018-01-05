/**
 * Created by steven on 18/1/4.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class AnchorInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'AnchorInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require' },   // 这里用user _id
      channelId: { type: 'string' },
      userName: { type: 'string', validation: 'require' },
      creator: { type: 'object', default: { _id: '', name: '', photo: '' } },
      dealUser: { type: 'object', default: { _id: '', name: '' } },
      photo: { type: 'string' },
      status: { type: 'string', default: AnchorInfo.STATUS.CONNECTING, validation: v => utils.isValueInObject(v, AnchorInfo.STATUS) },
      sourceId: { type: 'string' },
      targetId: { type: 'string' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
      type: { type: 'string', default: AnchorInfo.TYPE.mobileToPC, validation: v => utils.isValueInObject(v, AnchorInfo.TYPE) },
    };
  }

}

AnchorInfo.STATUS = {
  CONNECTING: '1', // 等待进入通道
  CONNECTED: '2', // 已进入通道
  REJECTED: '3',  // 拒绝
  CLOSED: '4',    // 挂断
  ERROR: '5',     // 出错
};

AnchorInfo.TYPE = {
  mobileToPC: '1',   // 手机端主动连PC端
  PCToMobile: '2',   // PC端主动连手机端
};

module.exports = AnchorInfo;
