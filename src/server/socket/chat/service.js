'use strict';

const result = require('../../common/result');
const sessionService = require('../../api/im/sessionService');
const contactService = require('../../api/im/contactService');
const activityService = require('../../api/im/activityService');
const messageService = require('../../api/im/messageService');

const service = {};

const json = function(err, r) {
  let rs = {};
  if(err) {
    rs = result.fail(err);
  }else {
    rs = result.success(r);
  }

  return JSON.stringify(rs);
};

const errorJSON = function (err) {
  return JSON.stringify(result.fail(err));
};

const successJSON = function (doc) {
  return JSON.stringify(result.success(doc));
};

//获取最近会话
service.getRecentContactList = function getRecentContactList(socket, query) {
  const page = query.page;
  const fieldNeeds = query.fieldsNeed;

  sessionService.getRecentContactList(socket.info.userId, page, 30, fieldNeeds, '-modifyTime', (err, docs) => {
    socket.emit('getRecentContactList', json(err, docs));
  });
};

//添加人，群，盒子到通讯录
service.addContact = function(socket, query) {
  contactService.add({
    targetId: query.targetId,
    targetName: query.targetName,
    photo: query.photo || '',
    type: query.type,
    fromWhere: query.fromWhere || 'web',
    details: query.details || {}
  }, socket.info.userId, (err, r) => {
    socket.emit('addContact', json(err, r));
  });
};

//创建新的会话。
service.createSession = function createSession(socket, query) {
  service.createSession(socket.info.userId, {
    name: query.name,
    type: query.type,
    members: query.members
  }, (err, r) => {
    socket.emit('createSession', json(err, r));
  });
};

//将一个人添加到现有点的会话中
service.addUserToSession = function addUserToSession(socket, query) {
  service.addUserToSession(query.sessionId, query.userId, (err, r) => {
    socket.emit('addUserToSession', json(err, r));
  });
};

//列出未读的消息，支持分页及seq
service.listUnReadMessage = function (socket, query) {
  activityService.getActivity(socket.info.userId, query.sessionId, (err, doc) => {
    if(err) {
      return socket.emit('listUnReadMessage', errorJSON(err));
    }

    messageService.listBySeq(query.sessionId, doc.seq, query.page, query.pageSize || 10, false, (err, docs) => {
      socket.emit('listUnReadMessage', json(err, docs));
    });

  });
};

//将session中已读的最好一条消息的seq记录，标识该用户在这个session中读到了哪条信息
service.hasRead = function(socket, query) {
  activityService.setSeq(socket.info.userId, query.sessionId, query.seq, (err, r) => {
    socket.emit('listUnReadMessage', json(err, r));
  });
};

service.sendMessage = function (socket, query) {

};

module.exports = service;
