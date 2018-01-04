/**
 * Created by steven on 18/1/4.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class AnchorInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'AnchorInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      channelId: { type: 'string'},
      user: {
        type: 'object', default: { _id: '', name: '' }
      },
      photo: { type: 'string' },
      status: { type: 'string', default: AnchorInfo.STATUS},
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

AnchorInfo.STATUS = {
  CONNECTING: '1', //等待进入通道
  CONNECTED: '2', //已进入通道
  REJECTED: '3',  //拒绝
  CLOSED: '4',    //挂断
  ERROR: '5',     //出错
}

module.exports = AnchorInfo;