/**
 * Created by chaoningx on 2017/2/27.
 */
const utils = require('../common/utils');

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
      if(ud[k]) {
        obj[k] = info[k];
      }
    }

    return obj;
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
