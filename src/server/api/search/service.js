/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const uuid = require('uuid');
const utils = require('../../common/utils');
const i18n = require('i18next');

const GroupInfo = require('../group/groupInfo');

const groupInfo = new GroupInfo();

const UserInfo = require('../user/userInfo');

const userInfo = new UserInfo();

const config = require('../../config');

const service = {};

service.searchUserOrGroup = function searchUserOrGroup(info, cb){
  const type = info.type;
  const keyword = info.keyword || '';
  const limit = info.limit || 10;
  const query = {};

  if(type !== '0' && type !== '1'){
    return cb && cb(i18n.t('searchUserOrGroupTypeNotCorrect'));
  }

  if(keyword){
    query.name = {$regex: keyword, $options: 'i'};
  }

  const searchUser = function searchUser(query){
    userInfo.collection.find(query, {fields: {name: 1, photo: 1}}).limit(limit).toArray(function(err, docs){
      if(err){
        return cb && cb(err);
      }

      return cb && cb(null, docs);
    })
  }

  const searchGroup = function searchGroup(query){
    groupInfo.collection.find(query, {fields: {name: 1, logo: 1}}).limit(limit).toArray(function(err, docs){
      if(err){
        return cb && cb(err);
      }

      return cb && cb(null, docs);
    })
  }

  if(type === '0'){
    searchUser(query);
  }else{
    searchGroup(query);
  }

}

module.exports = service;
