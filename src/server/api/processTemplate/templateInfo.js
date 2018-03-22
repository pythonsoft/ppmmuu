/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ProcessTemplateInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      type: { type: 'string', validation: 'require' },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
      groupId: { type: 'string' },
      groupName: { type: 'string' },
      templateId: { type: 'string' },
      templateName: { type: 'string' },
      processId: { type: 'string', validation: 'require' },
      apiTemplateUrl: { type: 'string' },
    };
  }
}

TemplateInfo.TYPE = {
  EDIT_TEMPLATE: '1',    // 快编
  LIBRARY: '2',          // 入库
  SHELF: '3',            // 上架
};

module.exports = TemplateInfo;
