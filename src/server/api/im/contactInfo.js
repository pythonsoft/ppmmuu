/**
 * Created by chaoningx on 17/11/12.
 */

'use strict';

const DB = require('../../common/db');
const config = require('../../config');

//通讯录
class ContactInfo extends DB {
  constructor() {
    super(config.dbInstance[`${config.dbName}DB`], 'IM_ContactInfo');

    this.struct = {
      _id: { type: 'string', validation: 'require', allowUpdate: false }, //如为人，则为人的ID，如果为群，那为群的ID，其它同理
      name: { type: 'string', validation: 'require' },
      photo: { type: 'string' },
      type: { type: 'string', allowUpdate: false, validation(v) {
        let flag = false;

        for (let k in ContactInfo.TYPE) {
          if(v === ContactInfo.TYPE[k]) {
            flag = true;
          }
        }

        return flag;
      }, default: () => ContactInfo.TYPE.C2C },
      ownerId: { type: 'string', validation: 'require' },
      createdTime: { type: 'date', validation: 'require', allowUpdate: false },
      modifyTime: { type: 'date', validation: 'require',  },
      whereFrom: { type: 'string' },
      details: { type: 'object' },
    };
  }
}

ContactInfo.TYPE = {
  PERSON: '0', // 人
  NORMAL_GROUP: '1', // 群
  TRANSFER_BOX: '2' // 传输盒子
};

module.exports = ContactInfo;
