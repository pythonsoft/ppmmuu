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
      creator: { type: 'object', default: { _id: '', name: '' } },
      department: { type: 'object', default: { _id: '', name: '' } },
      lastSendBacker: { type: 'object', default: { _id: '', name: '' } }, // 退回者
      lastSubmitter: { type: 'object', default: { _id: '', name: '' } }, // 最后提交人
      lastDeleter: { type: 'object', default: { _id: '', name: '' } }, // 最后删除人
      lastResume: { type: 'object', default: { _id: '', name: '' } }, // 最后删除人
      status: { type: 'string', validation: 'require', default: () => CatalogTaskInfo.STATUS.PREPARE },
      workflowStatus: { type: 'string', validation: 'require', default: () => CatalogTaskInfo.STATUS.PREPARE },
      taskList: { type: 'object' }, // 存放任务的ID, 结构为 { catalogId: '', taskList: [] }
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
    };
  }
}

CatalogTaskInfo.STATUS = {
  PREPARE: '0', // 待编目
  DOING: '1', // 编目中
  SUBMITTED: '2', // 已提交
  DELETE: '3', // 已删除
};

CatalogTaskInfo.WORKFLOW_STATUS = {
  PREPARE: '0', // 等待
  DOING: '1', // 处理中
  SUCCESS: '2', // 成功
  ERROR: '1000', // 失败
};

module.exports = CatalogTaskInfo;
