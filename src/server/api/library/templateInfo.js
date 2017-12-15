/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'Library_TemplateInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      source: { type: 'string', validation: 'require' }, // 来源：MAM, MAS, 。。。
      creator: { type: 'object', default() { return { _id: '', name: '' }; } },
      department: { type: 'object', validation: 'require', default() { return { _id: '', name: '' }; } },
      highTemplate: { type: 'object', default: { _id: '', name: '' } },
      lowTemplate: { type: 'object', default: { _id: '', name: '' } },
      windowsPath: { type: 'string' },
      linuxPath: { type: 'string' },
      highBitrateStandard: { type: 'object', default: { fileFomart: 'mxf', videoCode: 'mpeg2video', bitrate: '50000000' } },
      lowBitrateStandard: { type: 'object', default: { fileFomart: 'mp4', videoCode: 'libx264', bitrate: '1500000' } },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      bucketId: {
        type: 'string',
        validation: 'require',
      },
    };
  }

  getJobVo(info) {
    const templateIds = [];
    const highTemplateId = info.highTemplate ? info.highTemplate._id : '';
    const lowTemplateId = info.lowTemplate ? info.lowTemplate._id : '';
    templateIds.push({ high: highTemplateId });
    templateIds.push({ low: lowTemplateId });
    info.templateIds = templateIds;
    delete info.highTemplate;
    delete info.lowTemplate;
    return info;
  }

}

module.exports = TemplateInfo;
