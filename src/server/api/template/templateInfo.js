/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

class TemplateInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'TemplateInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => TemplateInfo.TYPE.DOWNLOAD },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' }
    };
  }

  createDownloadInfo(info) {
    return utils.merge({
      script: '',
      bucketId: ''
    }, info);
  }
};

TemplateInfo.TYPE = {
  DOWNLOAD: '1'
};

module.exports = TemplateInfo;
