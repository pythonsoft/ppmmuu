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
      objectId: { type: 'string', validation: 'require' },
      assignee: { type: 'object', default: { _id: '', name: '' } },
      owner: { type: 'object', default: { _id: '', name: '' } },
      department: { type: 'object', default: { _id: '', name: '' } },
      lastSendBacker: { type: 'object', default: { _id: '', name: '' } }, //退回者
      status: { type: 'string', validation: 'require', default: () => CatalogTaskInfo.STATUS.PREPARE },
      taskList: { type: 'array' }, //存放任务的ID
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
    };
  }
}

CatalogTaskInfo.STATUS = {
  PREPARE: '0', //待编目
  DOING: '1', // 编目中
  SUBMITTED: '2', // 已提交
  DELETE: '3', // 已删除
};

module.exports = CatalogTaskInfo;
