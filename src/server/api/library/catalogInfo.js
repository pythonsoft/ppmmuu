/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class CatalogInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'Library_CatalogInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      objectid: { type: 'string', validation: 'require' },
      englishName: { type: 'string', validation: 'require' },
      chineseName: { type: 'string', validation: 'require' },
      parent: { type: 'string', validation: 'require' },
      keyword: { type: 'string', validation: 'require' },
      source: { type: 'string', validation: 'require' },
      root: { type: 'string' },
      available: { type: 'string', default: () => CatalogInfo.AVAILABLE.NO },
      owner: { type: 'object', default() { return { _id: '', name: '' }; }  },
      department: { type: 'object', default() { return { _id: '', name: '' }; } },
      materialDate: { type: 'object', default() { return { from: '', to: '' } } }, // 素材日期 { from: '2017-03-21', to: '2017-03-21' }
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' }
    };
  }

}

CatalogInfo.AVAILABLE = {
  NO: '0',
  YES: '1',
};

module.exports = CatalogInfo;
