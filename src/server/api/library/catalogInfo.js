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
      fileInfo: { type: 'object', validation: 'require', default() { return { _id: '', name: '', originalPath: '', size: '0' }; } },
      objectId: { type: 'string', validation: 'require' },
      englishName: { type: 'string', validation: 'require' },
      chineseName: { type: 'string', validation: 'require' },
      parentId: { type: 'string' },
      keyword: { type: 'string' },
      content: { type: 'string', validation: 'require' },
      source: { type: 'string', validation: 'require' }, // 来源：MAM, MAS, 。。。
      version: { type: 'string', validation: 'require' },
      keyman: { type: 'string', validation: 'require' }, // 人物
      language: { type: 'string' }, // 语言
      root: { type: 'string' }, // 根结点ID
      type: { type: 'string', validation: 'require' }, // 类型：素材，节目，其它
      inpoint: { type: 'number', validation: 'require' },
      outpoint: { type: 'number', validation: 'require' },
      available: { type: 'string', default: () => CatalogInfo.AVAILABLE.NO },
      materialDate: { type: 'object', default() { return { from: '', to: '' }; } }, // 素材日期 { from: '2017-03-21', to: '2017-03-21' }
      owner: { type: 'object', default() { return { _id: '', name: '' }; } },
      department: { type: 'object', default() { return { _id: '', name: '' }; } },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
    };
  }

}

CatalogInfo.AVAILABLE = {
  NO: '0',
  YES: '1',
};

module.exports = CatalogInfo;
