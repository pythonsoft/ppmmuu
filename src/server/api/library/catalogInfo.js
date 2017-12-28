/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

class CatalogInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'Library_CatalogInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
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
      root: { type: 'string' }, // 根结点ID, 用于记录最开始时候的结点ID, 如果这条记录是根，那么置空
      type: { type: 'string', validation: 'require' }, // 类型：素材，节目，其它
      inpoint: { type: 'number', validation: 'require' },
      outpoint: { type: 'number', validation: 'require' },
      duration: { type: 'string' },
      available: { type: 'string', default: () => CatalogInfo.AVAILABLE.NO },
      materialDate: { type: 'object', default() { return { from: '', to: '' }; } }, // 素材日期 { from: '2017-03-21', to: '2017-03-21' }
      owner: { type: 'object', default() { return { _id: '', name: '' }; } },
      department: { type: 'object', default() { return { _id: '', name: '' }; } },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      details: { type: 'object' },
      fromWhere: {
        type: 'string',
        default: CatalogInfo.FROM_WHERE.HK_RUKU,
      },
      fullText: {
        type: 'string',
        default: '',
      },
      ccid: {             // 编目类
        type: 'string',
      },
      publishTime: {      // 发布日期
        type: 'string',
      },
      newsTime: {        // 新闻日期
        type: 'string',
      },
      airTime: {         // 首播日期
        type: 'string',
      },
      newsType: {        // 新闻类型
        type: 'string',
      },
      occurCountry: {    // 事发国家
        type: 'string',
      },
      madeLocation: {    // 制作地点
        type: 'string',
      },
      resourceDepartment: {  // 资源所属部门
        type: 'string',
      },
      hdFlag: {             // 高标清
        type: 'number',
      },
      pigeonhole: {        // 是否归档
        type: 'string',
      },
    };
  }

}

CatalogInfo.FROM_WHERE = {
  MAM: 'MAM',
  DAYANG: 'DAYANG',
  HK_RUKU: 'HK_RUKU',   //香港凤凰入库
};

CatalogInfo.AVAILABLE = {
  NO: '0',
  YES: '1',
};

module.exports = CatalogInfo;
