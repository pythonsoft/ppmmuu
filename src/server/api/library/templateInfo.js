/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const utils = require('../../common/utils');
const config = require('../../config');
const uuid = require('uuid');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'Library_TemplateInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      source: { type: 'string', validation: 'require' }, // 来源：MAM, MAS, 。。。
      creator: { type: 'object', default() { return { _id: '', name: '' }; } },
      department: { type: 'object', default() { return { _id: '', name: '' }; } },
      hdExt: { type: 'array' }, // 高码流文件后缀，用于当入库没有低码的时候，从此挑出高码流视频进行转码，支持多个
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      transcodeTemplateDetail: {
        type: 'object',
        default() {
          return {
            script: '',
            templatesId: [],
          };
        },
      },
      bucketId: {
        type: 'string'
      }
    };
  }

  getJobVo(info) {
    return utils.merge({
      _id: '',
      source: '',
      department: '',
      hdExt: [],
      bucketId: '',
      templateId: [], // { file: '', template: '' }
    }, info);
  }

}

module.exports = TemplateInfo;
