/**
 * Created by steven on 17/5/5.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'TemplateInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      type: { type: 'string', validation: 'require', default: () => TemplateInfo.TYPE.DOWNLOAD },
      subtitleType: { type: 'array' },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
      groupId: { type: 'string' },
      transcodeTemplateDetail: { type: 'object', default() { return { transcodeTemplateSelector: '', transcodeTemplates: [] }; } },
    };
  }

  createDownloadInfo(script, bucketId) {
    return { script, bucketId };
  }
}

TemplateInfo.TYPE = {
  DOWNLOAD: '1',
  DOWNLOAD_MEDIAEXPRESS: '2',
};


TemplateInfo.SUBTITLE_TYPE = {
  PLUGIN: '0',   // 外挂字幕
  STREAMING: '1',   // 流式字幕
  EMBEDDED: '2',     // 内嵌字幕
};


module.exports = TemplateInfo;
