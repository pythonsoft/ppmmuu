/**
 * Created by steven on 2017/6/20.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const i18n = require('i18next');
const config = require('../../config');
const uuid = require('uuid');

const AnchorInfo = require('./anchorInfo');
const anchorInfo = new AnchorInfo();

const ChannelInfo = require('./channelInfo');
const channelInfo = new ChannelInfo();

let service = {};

service.createAnchorInfo = function createAnchorInfo(info, cb){
  info._id = uuid.v1();
  anchorInfo.insertOne(info, (err, r)=>{
    if(err){
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, info._id);
  })
}

service.getAnchorInfo = function getChannelInfo(info, cb){
  const struct = {
    _id: { type: 'string', validation: 'require' }
  };
  const err = utils.validation(info, struct);
  if (err) {
    return cb && cb(err);
  }

  anchorInfo.collection.findOne({ _id: info._id}, (err, doc)=>{
    if(err){
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  })
}

service.createChannels = function createChannels(infos, cb){
  channelInfo.insertMany(infos, (err))
}

service.listChannels = function listChannels(info, cb){

}



module.exports = service;
