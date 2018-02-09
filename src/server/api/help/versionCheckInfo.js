/**
 * Created by chaoningx on 17/10/26.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class VersionCheckInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'help_VersionCheckInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require' },
      ip: { type: 'string', validation: 'require' },
      port: { type: 'string' },
      createdTime: { type: 'date', allowUpdate: false },
      details: { type: 'object', default() { return {}; } },
    };
  }
}

module.exports = VersionCheckInfo;
