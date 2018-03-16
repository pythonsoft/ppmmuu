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
      editorTemplate: { type: 'object', default: { _id: '', name: '' } },  // 用于快编的转码模板
      libraryTemplate: { type: 'object', default: { _id: '', name: '' } },                    // 入库模板
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
      description: { type: 'string' },
      subtitleType: { type: 'array' },
      downloadWorkPath: { type: 'string', validation: 'require' },
      transcodeWorkPath: { type: 'string', validation: 'require' },
    };
  }
}

module.exports = TemplateInfo;
