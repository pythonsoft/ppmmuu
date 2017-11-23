/**
 * Created by chaoningx on 17/9/20.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');
const uuid = require('uuid');

/**
 * @swagger
 * definitions:
 *   ShelfTaskInfo:
 *     required:
 *       - name
 *     properties:
 *       name:
 *         type: string
 */
class ShelfTaskInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'ShelfTaskInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, allowUpdate: false },
      name: { type: 'string', validation: 'require' },
      programNO: { type: 'string', validation: 'require' },  // 节目编号
      objectId: { type: 'string', validation: 'require' },
      assignee: { type: 'object', default: { _id: '', name: '' } },  // 派发人
      dealer: { type: 'object', default: { _id: '', name: '' } },   // 处理人
      creator: { type: 'object', default: { _id: '', name: '' } },  // 创建人
      department: { type: 'object', default: { _id: '', name: '' } }, // 部门
      lastSendBacker: { type: 'object', default: { _id: '', name: '' } }, // 退回者
      lastSubmitter: { type: 'object', default: { _id: '', name: '' } }, // 最后提交人
      lastDeleter: { type: 'object', default: { _id: '', name: '' } }, // 最后删除人
      lastOnliner: { type: 'object', default: { _id: '', name: '' } }, // 最后上架人
      lastOffliner: { type: 'object', default: { _id: '', name: '' } }, // 最后下架人
      lastEditAgainer: { type: 'object', default: { _id: '', name: '' } }, // 最后点击再编辑人
      status: { type: 'string', validation: 'require', default: () => ShelfTaskInfo.STATUS.PREPARE },
      operationTime: { type: 'date' }, // 派发或认领的时间
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      lastModifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      details: { type: 'object' },
      files: { type: 'array' },
      full_text: { type: 'string' },
      editorInfo: { type: 'object',
        default: {
          name: '',
          subscribeType: '',
          source: '',
          limit: '',
          cover: '',
        } },
      fromWhere: {
        type: 'number',
        default: '1',
      },
    };
  }
}

ShelfTaskInfo.STATUS = {
  PREPARE: '0', // 待认领
  DOING: '1', // 处理中
  SUBMITTED: '2', // 已提交(待上架)
  DELETE: '3', // 已删除
  ONLINE: '4', // 已上架
  OFFLINE: '5', //已下架
};

ShelfTaskInfo.DEAL_STATUS = [
  ShelfTaskInfo.STATUS.PREPARE,
  ShelfTaskInfo.STATUS.DOING,
  ShelfTaskInfo.STATUS.SUBMITTED,
  ShelfTaskInfo.STATUS.DELETE,
];

ShelfTaskInfo.LINE_STATUS = [
  ShelfTaskInfo.STATUS.SUBMITTED,
  ShelfTaskInfo.STATUS.ONLINE,
  ShelfTaskInfo.STATUS.OFFLINE,
];

ShelfTaskInfo.FILE_TYPE = {
  SUBTITLE: 11,      // 字幕
  HIGH_VIDEO: 5,     // 高清视频
  LOW_CODE_VIDEO: 2, // 低码流视音频
  VIDEO_SERVER: 3,   // 视频服务器
  LITI_VOICE: 6,     // 立体声音频
  DAN_VOICE: 1,      // 单声道音频
  KEY_FRAME: 4,      // 关键帧
  BIAO_QING: 0,      // 标清视频
  FU_JIAN: 100,      // 附件
  TU_WEN: 7,         // 图文
  HEAD_PHOTO: 10,     // 肖像
};

module.exports = ShelfTaskInfo;
