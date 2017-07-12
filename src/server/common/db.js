/**
 * Created by chaoningx on 2017/7/11.
 */

'use strict';

const utils = require('../common/utils');
const i18n = require('i18next');
const result = require('../common/result');

// { createdTime: { type: 'string', default: function() { return new Date() }, validation: function(v) {} || 'require' }, allowUpdate: true , unique: true}
// validation = function() { ... return result.fail(i18n.t()) || result.success() }

/**
 *
 * @param info
 * @param struct {Object}
 */
const validation = function validation(info, struct) {
  let temp = null;
  for (let k in info) {
    temp = struct[k];

    if (!temp) {
      return i18n.t('fieldIsNotExistError', { field: k })
    }



    if(typeof temp.type !== 'undefined' && info[k].constructor !== temp.type) {
      if(!temp.type === Date || !info[k].constructor === String) {
        return i18n.t('typeError', {field: k});
      }
    }

    if (temp.validation) {
       if(temp.validation === 'require') {
         if(info[k] !== 0 && !info[k]) {

           return i18n.t('requireError', { field: k });
         }
       } else if(typeof temp.validation === 'function' && !temp.validation(info[k])) {
         return i18n.t('validationError', { field: k });
       }
    }
  }

  return null;
};

const defaultValue = {
  'String': '',
  'Array': [],
  'Number': 0,
  'Object': {},
  'Boolean': true,
  'Date': function(){ return new Date()}
};

class DB {
  constructor(dbInstance, collectionName, struct) {
    this.collection = dbInstance.collection(collectionName);
    this.struct = struct;
    this.checkUnique = this.checkUnique.bind(this);
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
          if(typeof defaultValue[temp.type] === 'function'){
            doc[k] = defaultValue[temp.type]();
          }else {
            doc[k] = defaultValue[temp.type];
          }
        }else {
          doc[k] = null;
        }
      }
    };

    const err = validation(doc, struct);
    return {err: err, doc: doc};
  }

  updateAssign(info) {
    const struct = this.struct;
    const obj = {};
    let temp = null;

    for (let k in struct) {
      temp = struct[k];
      if(k == 'modifyTime'){
        obj['modifyTime'] = new Date();
      }
      if (info[k] !== undefined) {
        if (typeof temp.allowUpdate === 'undefined' || temp.allowUpdate) {
          obj[k] = info[k];
        }
      }
    }

    const err = validation(obj, struct);
    return {err: err, doc: obj};
  }

  getUniqueFields() {
    const struct = this.struct;
    const uniqueFields = {};
    let hasUniqueFields = false;
    for(let k in struct){
      if(struct[k].unique){
        uniqueFields[k] = 1;
        hasUniqueFields = true;
      }
    }

    if(!hasUniqueFields){
      return null;
    }

    return uniqueFields;
  }

  assignMany(infos){
    const newInfos = [];
    const uniqueFields = this.getUniqueFields();
    const queryOrArr = [];
    let err = null;
    for(let i = 0, len = infos.length; i < len; i++){
      const result = this.assign(infos[i]);
      if(result.err){
        err = result.err;
        break;
      }
      newInfos.push(result.doc);
    }
    return {err: errr, docs: newInfos};
  }

  updateAssignMany(infos){
    const newInfos = [];
    const uniqueFields = this.getUniqueFields();
    const queryOrArr = [];
    let err = null;
    for(let i = 0, len = infos.length; i < len; i++){
      const result = this.updateAssign(infos[i]);
      if(result.err){
        err = result.err;
        break;
      }
      newInfos.push(result.doc);
    }
    return {err: errr, docs: newInfos};
  }

  checkUniqueMany(infos, cb){
    const uniqueFields = this.getUniqueFields();
    const query = {};
    const queryOrArr = [];
    if(!uniqueFields){
      return cb && cb(null, info);
    }
    for(let i = 0, len = infos.length; i < len; i++) {
      const info = infos[i];
      const items = [];
      const q = {};

      for (const k in uniqueFields) {
        if (info[k] !== undefined) {
          const temp = {};
          temp[k] = info[k];
          items.push(temp);
        }
      }

      if(items.length){
        q.$or = items;
        queryOrArr.push(q);
      }
    }

    if(!queryOrArr.length){
      return cb && cb(null);
    }


    query.$or = queryOrArr;

    this.collection.findOne(query, { fields: uniqueFields }, (err, doc) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null, info);
      }

      for (const k in uniqueFields) {
        if (doc[k] === info[k]) {
          return cb && cb(i18n.t('uniqueError', { field: k, value: info[k] }));
        }
      }
    });
  }

  insertOne(info, cb) {
    const result = this.assign(info);
    if(result.err){
      return cb & cb(result.err);
    }

    const doc = result.doc;
    const me = this;

    this.checkUnique(doc, false, function(err){
      if(err){
        return cb && cb(err);
      }

      me.collection.insertOne(doc, function(err){
        if(err){
          return cb && cb(i18n.t('databaseError'))
        }

        return cb && cb(null);
      })
    })
  }

  insertMany(infos, cb) {
    const result = this.assignMany(infos);
    if(result.err){
      return cb & cb(result.err);
    }

    const docs = result.docs;
    const me = this;

    this.checkUniqueMany(docs, false, function(err){
      if(err){
        return cb && cb(err);
      }

      me.collection.insertMany(docs, function(err){
        if(err){
          return cb && cb(i18n.t('databaseError'))
        }

        return cb && cb(null);
      })
    })
  }

  updateOne(query, info, cb) {
    const result = this.updateAssign(info);
    if(result.err){
      return cb & cb(result.err);
    }

    const doc = result.doc
    const me = this;

    this.checkUnique(doc, true, function(err){
      if(err){
        return cb && cb(err);
      }
      me.collection.updateOne(query, {$set: doc}, function(err, doc){
        if(err){
          return cb && cb(err);
        }
        return cb && cb(null, doc);
      })
    })
  }

  updateMany(query, info, cb) {
    const result = this.updateAssign(info);
    if (result.err) {
      return cb & cb(result.err);
    }

    const doc = result.doc
    const me = this;

    this.checkUnique(doc, true, function (err) {
      if (err) {
        return cb && cb(err);
      }
      me.collection.updateMany(query, {$set: doc}, function (err, r) {
        if (err) {
          return cb && cb(err);
        }
        return cb && cb(null, {});
      })
    })
  }

  checkUnique(info, isUpdate = false, cb) {
    const uniqueFields = this.getUniqueFields();
    if(!uniqueFields){
      return cb && cb(null, info);
    }

    const queryOrArr = [];
    const query = {};

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
      return cb && cb(null, info);
    }

    this.collection.findOne(query, { fields: uniqueFields }, (err, doc) => {
      if (err) {
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(null, info);
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
