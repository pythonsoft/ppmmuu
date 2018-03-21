/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

class ItemInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'MovieEditor_ItemInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      creator: { type: 'object', default: {} },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      parentId: { type: 'string', validation: 'require' },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => ItemInfo.TYPE.DIRECTORY },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      snippet: { type: 'object', default: () => null },
      details: { type: 'object' },
      canRemove: { type: 'string', default: () => ItemInfo.CAN_REVMOE.YES },
      ownerType: { type: 'string', default: ItemInfo.OWNER_TYPE.MINE },
    };
  }
}

ItemInfo.Snippet = {
  thumb: '',
  input: 0,
  output: 1,
  duration: 0,
};

ItemInfo.TYPE = {
  DIRECTORY: '0',
  SNIPPET: '1',
  DEFAULT_DIRECTORY: '2',
};

ItemInfo.CAN_REVMOE = {
  YES: '1',
  NO: '0',
};

ItemInfo.OWNER_TYPE = {
  SHOULU: '1',    // 收录素材
  NEWS: '2',      // 新闻素材
  SHARE: '3',     // 共享素材
  MINE: '4',      // 我的素材
};

module.exports = ItemInfo;
