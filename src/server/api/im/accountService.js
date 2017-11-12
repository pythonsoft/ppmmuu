const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const userService = require('../user/service');

const AccountInfo = require('./accountInfo');

const accountInfo = new AccountInfo();

const service = {};

service.login = function(id, cb) {
  if(!id) {
    return cb && cb(i18n.t('imAccountFieldsIsNull', { fields: 'id' }));
  }
  accountInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if(doc) {
      return cb && cb(null, doc);
    }

    userService.getUsers(id, (err, docs) => {
      if(err) {
        return cb && cb(err);
      }

      if(!docs || docs.length === 0) {
        return cb && cb(i18n.t('imUserIsNotExist'));
      }

      const info = utils.merge({
        _id: '',
        name: '',
        email: '',
        photo: '',
      }, docs[0]);

      info.createdTime = new Date();

      accountInfo.insertOne(info, (err, r) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        return cb && cb(null, info);
      });

    });

  });
};

service.update = function (id, updateInfo, cb) {
 if(id) {
   return cb && cb(i18n.t('imAccountFieldsIsNull', { fields: 'id' }));
 }

 if(updateInfo._id) {
   delete updateInfo._id;
 }

 updateInfo.modifyTime = new Date();

 accountInfo.updateOne({ _id: id }, updateInfo, (err, r) => {
   if (err) {
     logger.error(err.message);
     return cb && cb(i18n.t('databaseError'));
   }

   return cb && cb(null, r);
 });

};

service.getUsers = function getUsers(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('imAccountFieldsIsNull', { fields: 'id' }));
  }
  const q = {};

  if(ids.constructor === Array) {
    q._id = { $in: ids }
  }else if(ids.indexOf(',')) {
    q._id = { $in: ids.split(',') }
  }else {
    q._id = ids;
  }

  let cursor = accountInfo.collection.find(q);
  const fieldsNeed = '_id,photo,name';
  cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

module.exports = service;
