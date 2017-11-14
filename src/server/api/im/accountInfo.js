/**
 * Created by steven on 17/11/12.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');
const uuid = require('uuid');

class AccountInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'IM_AccountInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require', allowUpdate: false },
      name: { type: 'string' },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      email: { type: 'string', validation: utils.checkEmail },
      photo: { type: 'string' },
      detail: { type: 'object' },
      description: { type: 'string' },
    };
  }

}

module.exports = AccountInfo;
