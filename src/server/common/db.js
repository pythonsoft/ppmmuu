/**
 * Created by chaoningx on 2017/2/27.
 */
const config = require('../config');
const utils = require('../common/utils');

class DB {
  constructor(collectionName) {
    this.collection = config.mongodb.dbInstance.collection(collectionName);
    this.doc = {};
  }

  assign(info) {
    return utils.merge(Object.assign({}, this.doc), info);
  }

  pagination(query, page, pageSize, callback, sortFields, fieldsNeed) {
    let collection = this.collection;
    collection.count(query, function(err, count) {
      if(err) {
        callback && callback(err);
        return false;
      }

      let cursor = collection.find(query, fieldsNeed || {});
      page = page * 1 || 1;
      pageSize = pageSize * 1 || 10;
      cursor.sort(sortFields);
      cursor.skip(page ? ((page - 1) * pageSize) : (0 * pageSize));
      cursor = cursor.limit(pageSize * 1);
      cursor.toArray(function(err, items) {
        if(err) {
          callback && callback(err);
          return false;
        }

        let pageCount =  ((count / pageSize) | 0) + (count % pageSize ? 1 : 0);
        page = page > pageCount ? pageCount : page;
        let rs = { docs: items, page: page, pages: pageCount, limit: pageSize, total: count };
        callback && callback(null, rs);
      });
    });
  }
}

module.exports = DB;
