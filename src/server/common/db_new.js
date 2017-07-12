/**
 * Created by chaoningx on 2017/7/11.
 */

'use strict';

const utils = require('../common/utils');
const i18n = require('i18next');
const result = require('../common/result');

// { createdTime: { type: 'string', default: function() { return new Date() }, validation: function(v) {} || 'require' }, allowUpdate: true }
// validation = function() { ... return result.fail() || result.success() }

/**
 *
 * @param info
 * @param struct {Object}
 */
const validation = function validation(info, struct) {
  let rs = result.success(info);
  let temp = null;

  for (let k in info) {
    temp = struct[k];

    if (!temp) {
      rs = result.fail(i18n.t('fieldIsNotExistError', { field: k }));
      break;
    }

    if(typeof temp.type !== 'undefined' && typeof info[k] !== temp.type) {
      rs = result.fail(i18n.t('typeError', { field: k }));
      break;
    }

    if (temp.validation) {
       if(temp.validation === 'require') {
         if(info[k] !== 0 && !info[k]) {
           rs = result.fail(i18n.t('requireError', { field: k }));
         }
       } else if(typeof temp.validation === 'function') {
         const r = temp.validation(info[k]);

         if(r.status !== '0') {
           rs = r;
           break;
         }
       }
    }
  }

  return rs;
};

const defaultValue = {
  'string': '',
  'array': [],
  'number': 0,
  'object': {},
  'boolean': true,
};

class DB {
  constructor(dbInstance, collectionName, struct) {
    this.collection = dbInstance.collection(collectionName);
    this.struct = struct;
  }

  assign(info) {
    const doc = {};
    const struct = this.struct;
    let temp = null;
    let defaultType = null;

    for (let k in struct) {
      temp = struct[k];

      if (typeof info[k] !== 'undefined') {
        doc[k] = info[k];
      }else {
        defaultType = typeof temp.default;
        if (defaultType !== 'undefined') {
          doc[k] = defaultType === 'function' ? temp.default() : temp.default;
        } else if (temp.type && typeof defaultValue[temp.type] !== 'undefined') {
          doc[k] = defaultValue[temp.type];
        }else {
          doc[k] = null;
        }
      }
    };

    return validation(doc, struct)
  }

  updateAssign(info) {
    const struct = this.struct;
    const obj = {};
    let temp = null;

    for (let k in info) {
      temp = struct[k];
      if (typeof temp !== 'undefined') {
        if (typeof temp.allowUpdate === 'undefined' || temp.allowUpdate) {
          obj[k] = info[k];
        }
      }
    }

    return validation(obj, struct);
  }

  checkUnique(info, isUpdate = false, cb) {
    const uniqueFields = this.uniqueFields || '';
    const queryOrArr = [];
    const query = {};
    if (!uniqueFields) {
      return cb && cb(null);
    }
    for (const k in uniqueFields) {
      if (info[k] !== undefined) {
        const temp = {};
        temp[k] = info[k];
        queryOrArr.push(temp);
      }
    }

    query.$or = queryOrArr;
    if (isUpdate) {
      query._id = { $ne: info._id };
    }

    if (queryOrArr.length === 0) {
      return cb && cb(null);
    }

    this.collection.findOne(query, { fields: uniqueFields }, (err, doc) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null);
      }

      for (const k in uniqueFields) {
        if (doc[k] === info[k]) {
          return cb && cb(i18n.t('uniqueError', { field: k, value: info[k] }));
        }
      }
    });
  }

  /**
   * 分页组件
   * @param query 查询条件
   * @param page 页码
   * @param pageSize 每页显示条数
   * @param callback 回调函数
   * @param sortFields 排序，传入格式如：'-createdTime,name', "-"代表倒序，没有写代表正序，多个使用","号分割
   * @param fieldsNeed 希望返回的字段，传入格式如：'-createdTime,name', "-"代表不希望返回，多个使用","号分割
   */
  pagination(query, page, pageSize, callback, sortFields, fieldsNeed) {
    const collection = this.collection;
    collection.count(query, (err, count) => {
      if (err) {
        return callback && callback(err);
      }

      page = page ? page * 1 : 1;
      pageSize = pageSize ? pageSize * 1 : 30;

      let cursor = collection.find(query);

      if (sortFields) {
        cursor.sort(utils.formatSortOrFieldsParams(sortFields, true));
      }

      cursor.skip(page ? ((page - 1) * pageSize) : 0);
      cursor = cursor.limit(pageSize);

      if (fieldsNeed) {
        cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
      }

      cursor.toArray((err, items) => {
        if (err) {
          return callback && callback(err);
        }

        const pageCount = ((count / pageSize) | 0) + (count % pageSize ? 1 : 0);
        page = page > pageCount ? pageCount : page;

        return callback && callback(null, { docs: items, page, pageCount, pageSize, total: count });
      });
    });
  }
}

module.exports = DB;
