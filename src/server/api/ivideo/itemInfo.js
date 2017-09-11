/**
 * Created by steven on 17/5/5.
 */

'use strict';

const uuid = require('uuid');

const DB = require('../../common/db');
const config = require('../../config');

class ItemInfo extends DB {
  constructor() {
    super(config.dbInstance.umpDB, 'MovieEditor_ItemInfo');

    this.struct = {
      _id: { type: 'string', default() { return uuid.v1(); }, validation: 'require' },
      name: { type: 'string', validation: 'require' },
      creatorId: { type: 'string', validation: 'require', allowUpdate: false },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      parentId: { type: 'string', validation: 'require' },
      type: { type: 'string', allowUpdate: false, validation: 'require', default: () => ItemInfo.TYPE.DIRECTORY },
      modifyTime: { type: 'date', validation: 'require' },
      description: { type: 'string' },
      snippet: { type: 'object', default: () => null },
      details: { type: 'object' },
      canRemove: { type: 'string', default: () => ItemInfo.CAN_REVMOE.YES }
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
  DEFAULT_DIRECTORY: '2'
};

ItemInfo.CAN_REVMOE = {
  YES: '1',
  NO: '0',
};

module.exports = ItemInfo;
