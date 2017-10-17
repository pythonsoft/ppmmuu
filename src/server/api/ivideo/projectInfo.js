/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

class ProjectInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'MovieEditor_ProjectInfo');

    this.struct = {
      _id: { type: 'string', default: () => uuid.v1() },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => ProjectInfo.TYPE.PROJECT_RESOURCE },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      canRemove: { type: 'string', allowUpdate: false, default: () => '1' },
      details: { type: 'object' },
    };
  }
}

ProjectInfo.TYPE = {
  MY_RESOURCE: '0',
  PROJECT_RESOURCE: '1',
};

module.exports = ProjectInfo;
