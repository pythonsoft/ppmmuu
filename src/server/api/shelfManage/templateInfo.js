/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'Shelf_TemplateInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default() { return { _id: '', name: '' }; } },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      bucketId: {
        type: 'string',
        validation: 'require',
      },
      transcodeTemplateDetail: {
        type: 'object',
        default() {
          return {
            transcodeTemplateSelector: '',
            transcodeTemplates: [],
          };
        },
      },
      script: { type: 'string' },     // 路径脚本
      typeScript: { type: 'string' },  // 转码生成的文件格式脚本
      description: { type: 'string' },
      subtitleType: { type: 'array' },
    };
  }
}

module.exports = TemplateInfo;
