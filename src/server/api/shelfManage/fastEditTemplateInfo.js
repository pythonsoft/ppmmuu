/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class FastEditTemplateInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'FastEdit_TemplateInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      name: { type: 'string', validation: 'require' },
      creator: { type: 'object', default() { return { _id: '', name: '' }; } },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      downloadWorkPath: { type: 'string', validation: 'require' },
      transcodeWorkPath: { type: 'string', validation: 'require' },
      transcodeTemplateId: { type: 'string', validation: 'require' },
      transcodeTemplateName: { type: 'string', validation: 'require' },
      storagePath: { type: 'string', validation: 'require' },
      description: { type: 'string' },
    };
  }
}

module.exports = FastEditTemplateInfo;
