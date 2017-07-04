/**
 * Created by chaoningx on 2017/2/27.
 */
const utils = require('../common/utils');
const i18n = require('i18next');

class DB {
  constructor(dbInstance, collectionName) {
    this.collection = dbInstance.collection(collectionName);
    this.doc = {};
    this.updateDoc = {};
  }

  assign(info) {
    return utils.merge(this.doc, info);
  }

  updateAssign(info) {
    const ud = this.updateDoc;
    let obj = {};

    for(let k in info) {
      if(ud[k] !== undefined) {
        obj[k] = info[k];
      }
    }

    if(ud['modifyTime']){
      obj['modifyTime'] = new Date();
    }

    return obj;
  }

  validateCreateError(needValidateFields, info) {
    for(let k in needValidateFields){
      if(info[k] === undefined || info[k] === ""){
        return i18n.t("validateError", { param: k})
      }else{
        if(this.validateFunc){
          let fn = this.validateFunc[k];
          if(fn && !fn(info[k])){
            return i18n.t("validateError", { param: k})
          }
        }
      }
    }
    return null;
  }

  validateUpdateError(needValidateFields, info){
    for(let k in needValidateFields){
      if(info[k] === undefined){
        continue;
      }
      else if(info[k] === ""){
        return i18n.t("validateError", { param: k})
      }else{
        if(this.validateFunc){
          let fn = this.validateFunc[k];
          if(fn && !fn(info[k])){
            return i18n.t("validateError", { param: k})
          }
        }
      }
    }
    return null;
  }

  checkUnique(info, isUpdate=false, cb){
    let uniqueFields = this.uniqueFields || "";
    let queryOrArr = [];
    let query = {};
    if(!uniqueFields){
      return cb && cb(null)
    }
    for(let k in uniqueFields){
      if(info[k] !== undefined){
        let temp = {};
        temp[k] = info[k];
        queryOrArr.push(temp);
      }
    }

    query.$or = queryOrArr;
    if(isUpdate){
      query._id = {$ne: info._id}
    }

    if(queryOrArr.length == 0){
      return cb && cb(null)
    }

    this.collection.findOne(query, {fields: uniqueFields}, function(err, doc){
      if(err){
        return cb && cb(i18n.t("databaseError"));
      }

      if(!doc){
        return cb && cb(null);
      }

      for(let k in uniqueFields){
        if(doc[k] == info[k]){
          return cb && cb(i18n.t("uniqueError", {field: k, value: info[k]}));
        }
      }

    })
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
    let collection = this.collection;
    collection.count(query, function(err, count) {
      if(err) {
        callback && callback(err);
        return false;
      }

      page = page ? page * 1 : 1;
      pageSize = pageSize ? pageSize * 1 : 30;

      let cursor = collection.find(query);

      if(sortFields) {
        cursor.sort(utils.formatSortOrFieldsParams(sortFields, true));
      }

      cursor.skip(page ? ((page - 1) * pageSize) : 0);
      cursor = cursor.limit(pageSize);

      if(fieldsNeed) {
        cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));
      }

      cursor.toArray(function(err, items) {
        if(err) {
          callback && callback(err);
          return false;
        }

        const pageCount =  ((count / pageSize) | 0) + (count % pageSize ? 1 : 0);
        page = page > pageCount ? pageCount : page;

        callback && callback(null, { docs: items, page: page, pageCount: pageCount, pageSize: pageSize, total: count });
      });
    });
  }
}

module.exports = DB;
