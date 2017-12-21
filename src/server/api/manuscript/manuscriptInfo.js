/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');
const utils = require('../../common/utils');

/**
 * @swagger
 * definitions:
 *   ManuscriptInfo:
 *     required:
 *       - title
 *       - editContent
 *     properties:
 *       title:
 *         type: string
 *       viceTitle:
 *         type: string
 *       editContent:
 *         type: array
 *         items:
 *           type: object
 *           properties:
 *             tag:
 *               type: string
 *               description: '标签'
 *             content:
 *               type: string
 *               description: '内容'
 *             modifyTime:
 *               type: string
 *               description: '修改时间'
 *       creator:
 *         type: object
 *       type:
 *         type: string
 *         description: '稿件类别'
 *       contentType:
 *         type: string
 *         description: '类别'
 *       source:
 *         type: string
 *         description: '来源'
 *       important:
 *         type: string
 *         description: '重要性'
 *       collaborators:
 *         type: array
 *         items:
 *           type: object
 *       status:
 *         type: object
 *       attachments:
 *         type: array
 *         items:
 *           type: object
 *       createdTime:
 *         type: string
 *       modifyTime:
 *         type: string
 *       description:
 *         type: string
 *       detail:
 *         type: object
 */
class ManuscriptInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ManuscriptInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); } },
      title: { type: 'string', validation: 'require' },
      viceTitle: { type: 'string' },
      collaborators: { type: 'array' },
      editContent: {
        type: 'array',
        default: [{ tag: '2', content: '', modifyTime: new Date() }],
      },
      type: { type: 'string', default: ManuscriptInfo.TYPE.SOT, validation: v => utils.isValueInObject(v, ManuscriptInfo.TYPE) },
      contentType: { type: 'string', default: ManuscriptInfo.CONTENT_TYPE.ZHENGDIAN, validation: v => utils.isValueInObject(v, ManuscriptInfo.CONTENT_TYPE) },
      source: { type: 'string', default: ManuscriptInfo.SOURCE.HK, validation: v => utils.isValueInObject(v, ManuscriptInfo.SOURCE) },
      important: { type: 'string', default: ManuscriptInfo.IMPORTANT.HIGH, validation: v => utils.isValueInObject(v, ManuscriptInfo.IMPORTANT) },
      creator: { type: 'object', default: { _id: '', name: '' }, allowUpdate: false },
      status: { type: 'string', default: ManuscriptInfo.STATUS.DRAFTS, validation: v => utils.isValueInObject(v, ManuscriptInfo.STATUS) },
      attachments: { type: 'array' },
      toWhere: { type: 'string', default: ManuscriptInfo.TO_WHERE.DAYANG },
      createdTime: { type: 'date', allowUpdate: false },
      modifyTime: { type: 'date' },
      description: { type: 'string' },
      detail: { type: 'object' },
    };
  }

}

ManuscriptInfo.TO_WHERE = {
  DAYANG: 'DAYANG',
};

ManuscriptInfo.TAGS = {
  KOUBO: '1',     // 口播
  ZHENWEN: '2',   // 正文
  TONGSHENGQI: '3', // 同声期
  XIANCHANG_PEIYIN: '4', // 现场配音
  ZIMU: '5',        // 字幕
  BEIZHU: '6',       // 备注
};

ManuscriptInfo.STATUS = {
  DRAFTS: '1',
  SUBMITTED: '2',
  DUSTBIN: '3',
};

ManuscriptInfo.STATUS_VALS = ['1', '2', '3'];
ManuscriptInfo.STATUS_MAP = {
  1: '草稿',
  2: '已提交',
  3: '垃圾箱',
};

ManuscriptInfo.TYPE = {  // 稿件类别
  SOT: '1',
  GANGAO: '2',
};

ManuscriptInfo.CONTENT_TYPE = {  // 类别
  ZHENGDIAN: '1',
  ZHITONGCHE: '2',
  QUANMEITI: '3',
  ZAOBANCHE: '4',
  QUANQIULIANXIAN: '5',
  EDITORTIME: '6',
  HUAWEN_ONLINE: '7',
  DIANDIPIAN: '8',
  GUANTOU: '9',
  GUOJI: '10',
  GANGAO: '11',
  TAIWAN: '12',
  DALU: '13',
  CAIJING: '14',
  TIYU: '15',
  YULE: '16',
  ZHUANTI: '17',
  OTHERS: '18',
  HONGKONG_TV: '19',
};

ManuscriptInfo.SOURCE = {  // 来源
  HK: '1',
  BJ: '2',
  NY: '3',
  SAN: '4',  // 三藩市
  LA: '5',
  WAS: '6',  // 华盛顿
  PAR: '7',  // 巴黎
  LON: '8',
  MOS: '9',
  TKY: '10', // 东京
  SYD: '11', // 悉尼
  TER: '12', // 德黑兰
  SH: '13',
  SZ: '14',
  TW: '15',
  TYJZ: '16', // 特约记者
  YULE: '17', // 娱乐新闻
  OTHERS: '18',
};

ManuscriptInfo.IMPORTANT = { // 重要性
  HIGH: '1',
  NORMAL: '2',
  URGENT: '3',
};

ManuscriptInfo.CONVERSION_TYPE = {
  HK_TO_SIMPLIFIED: '0',  // 香港繁体转简体
  SIMPLIFIED_TO_HK: '1',   // 简体转香港繁体
};

ManuscriptInfo.LIST_TYPE = {
  OWNER: '1',        // 自己创建的类型
  COLLABORATOR: '2',  // 协作类型
};

ManuscriptInfo.DELETED = '4';

module.exports = ManuscriptInfo;
