/**
 * Created by steven on 18/1/4.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class ChannelInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ChannelInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      photo: { type: 'string' },
      name: { type: 'string' },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

module.exports = ChannelInfo;
