/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class CatalogTaskInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'Library_CatalogTaskInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      name: { type: 'string', validation: 'require' },
      objectid: { type: 'string', validation: 'require' },
      assignee: { type: 'object', default() { return { _id: '', name: '' }; }  },
      owner: { type: 'object', default() { return { _id: '', name: '' }; }  },
      status: { type: 'string', validation: 'require', default: () => CatalogTaskInfo.STATUS.PREPARE },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
    };
  }
}


CatalogTaskInfo.STATUS = {
  PREPARE: '0',
  DOING: '1',
  SUBMITTED: '2',
  DELETE: '3',
};

module.exports = CatalogTaskInfo;
