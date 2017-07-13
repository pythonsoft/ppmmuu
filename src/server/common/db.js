/**
 * Created by chaoningx on 2017/7/11.
 */

'use strict';

const utils = require('../common/utils');
const i18n = require('i18next');

// { createdTime: { type: 'string', default: function() { return new Date() }, validation: function(v) {} || 'require' }, allowUpdate: true , unique: true}
// validation = function() { ... return result.fail(i18n.t()) || result.success() }

/**
 *
 * @param info
 * @param struct {Object}
 */
const validation = function validation(info, struct) {
  let temp = null;

  for (const k in info) {
    temp = struct[k];

    if (!temp) {
      return i18n.t('fieldIsNotExistError', { field: k });
    }

    if (typeof temp.type !== 'undefined' && info[k].constructor !== temp.type) {
      if (!temp.type === Date || !info[k].constructor === String) {
        return i18n.t('typeError', { field: k });
      }
    }

    if (temp.validation) {
      if (temp.validation === 'require') {
        if (info[k] !== 0 && !info[k]) {
          return i18n.t('requireError', { field: k });
        }
      } else if (typeof temp.validation === 'function' && !temp.validation(info[k])) {
        return i18n.t('validationError', { field: k });
      }
    }
  }

  return null;
};

const defaultValue = {
  String: '',
  Array: [],
  Number: 0,
  Object: {},
  Boolean: true,
  Date() { return new Date(); },
};

class DB {
  constructor(dbInstance, collectionName) {
    this.collection = dbInstance.collection(collectionName);
    this.struct = {};
  }

  assign(info) {
    const doc = {};
    const struct = this.struct;
    let temp = null;
    let defaultType = null;

    for (const k in struct) {
      temp = struct[k];

      if (typeof info[k] !== 'undefined') {
        doc[k] = info[k];
      } else {
        defaultType = typeof temp.default;
        if (defaultType !== 'undefined') {
          doc[k] = defaultType === 'function' ? temp.default() : temp.default;
        } else if (temp.type && typeof defaultValue[temp.type] !== 'undefined') {
          if (typeof defaultValue[temp.type] === 'function') {
            doc[k] = defaultValue[temp.type]();
          } else {
            doc[k] = defaultValue[temp.type];
          }
        } else {
          doc[k] = null;
        }
      }
    }

    const err = validation(doc, struct);
    return { err, doc };
  }

  updateAssign(info) {
    const struct = this.struct;
    const doc = {};
    let temp = null;
    
    for (const k in info) {
      const temp = struct[k];
      if (temp !== undefined) {
        if (typeof temp.allowUpdate === 'undefined' || temp.allowUpdate ) {
          doc[k] = info[k];
        }
      }
    }

    const err = validation(doc, struct);
    return { err, doc };
  }

  getUniqueFields() {
    const struct = this.struct;
    const uniqueFields = {};
    let hasUniqueFields = false;

    for (const k in struct) {
      if (struct[k].unique) {
        uniqueFields[k] = 1;
        hasUniqueFields = true;
      }
    }

    if (!hasUniqueFields) {
      return null;
    }

    return uniqueFields;
  }

  assignMany(infos) {
    const docs = [];
    let err = null;

    for (let i = 0, len = infos.length; i < len; i++) {
      const result = this.assign(infos[i]);

      if (result.err) {
        err = result.err;
        break;
      }

      docs.push(result.doc);
    }
    return { err, docs };
  }

  updateAssignMany(infos) {
    const newInfos = [];
    let err = null;

    for (let i = 0, len = infos.length; i < len; i++) {
      const result = this.updateAssign(infos[i]);
      if (result.err) {
        err = result.err;
        break;
      }
      newInfos.push(result.doc);
    }

    return { err, docs: newInfos };
  }

  insertOne(info, cb) {
    const result = this.assign(info);

    if (result.err) {
      return cb & cb(result.err);
    }

    const doc = result.doc;
    const me = this;

    this.checkUnique(doc, false, (err) => {
      if (err) {
        return cb && cb(err);
      }

      me.collection.insertOne(doc, (err, r) => {
        if (err) {
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, r);
      });
    });
  }

  insertMany(infos, cb) {
    const result = this.assignMany(infos);

    if (result.err) {
      return cb & cb(result.err);
    }

    const me = this;
    const docs = result.docs;

    this.checkUnique(docs, false, (err) => {
      if (err) {
        return cb && cb(err);
      }

      me.collection.insertMany(docs, (err, r) => {
        if (err) {
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, r);
      });
    });
  }

  updateOne(query, info, cb) {
    const result = this.updateAssign(info);

    if (result.err) {
      return cb & cb(result.err);
    }

    const me = this;
    const doc = result.doc;

    this.checkUnique(doc, true, (err) => {
      if (err) {
        return cb && cb(err);
      }

      me.collection.updateOne(query, { $set: doc }, (err, r) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, r);
      });
    });
  }

  updateMany(query, info, cb) {
    const result = this.updateAssign(info);

    if (result.err) {
      return cb & cb(result.err);
    }

    const me = this;
    const doc = result.doc;

    this.checkUnique(doc, true, (err) => {
      if (err) {
        return cb && cb(err);
      }

      me.collection.updateMany(query, { $set: doc }, (err, r) => {
        if (err) {
          return cb && cb(err);
        }

        return cb && cb(null, r);
      });
    });
  }

  checkUnique(infos, isUpdate = false, cb) {
    const uniqueFields = this.getUniqueFields();

    if (!uniqueFields) {
      return cb && cb(null, infos);
    }

    let docs = [];

    if (infos.constructor !== Array) {
      docs.push(infos);
    }else {
      const temp = [];
      temp.push(infos);
      docs = temp;
    }

    const q = {};
    const query = { $or: [] };

    for (let i = 0, len = docs.length; i < len; i++) {
      const info = docs[i];

      for(const attr in info) {
        if(uniqueFields[attr]) {
          if(!q[attr]) {
            q[attr] = { $in: [] };
          }
          q[attr]['$in'].push(info[attr]);
        }
      }
      
      if(isUpdate && info['_id']) {
        if(!query._id) {
          query._id = { $nin: [] };
        }
        query['_id']['$nin'].push(info['_id']);
      }
    }

    if(!utils.isEmptyObject(q)) {
      return cb && cb(null, infos);
    }

    for (const qk in q) {
      const temp = {};
      temp[qk] = q[qk];
      query.$or.push(temp);
    }

    const whichFieldIsSame = function whichFieldIsSame(source, target, fields) {
      for (const k in fields) {
        if (source[k] === target[k]) {
          return i18n.t('uniqueError', { field: k, value: target[k] });
        }
      }

      return false;
    };

    this.collection.find(query).project(uniqueFields).toArray((err, findDocs) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }

      if (!findDocs || findDocs.length === 0) {
        return cb && cb(null, findDocs);
      }

      let findDoc = null;
      let doc = null;
      let flag = '';

      for(let i = 0, len = findDocs.length; i < len; i++) {
        findDoc = findDocs[i];
        for(let j = 0, l = docs.length; j < l; j++) {
          doc = docs[i];
          flag = whichFieldIsSame(findDoc, doc, uniqueFields);
          if(flag) {
            return cb && cb(flag);
          }
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
