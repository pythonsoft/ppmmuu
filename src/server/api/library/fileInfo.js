/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class FileInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'Library_FileInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      name: { type: 'string', validation: 'require' },

      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => FileInfo.TYPE.DOWNLOAD },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
    };
  }
}

FileInfo.TYPE = {
  DOWNLOAD: '1',
};

module.exports = FileInfo;
