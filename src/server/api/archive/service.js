'use strict';

const config = require('../../config');
const WebosApi = require('../../common/webosAPI');

const service = {};

const webosName = 'duxiang@phoenixtv.com';
const webosPasswd = 'duxiangduxiangduxiang';

const wos = new WebosApi(config.WEBOS_SERVER);

function accessWebosApi(method, params, cb) {
  wos.getTicket(webosName, webosPasswd, (err, ticket) => {
    if (err) {
      return cb && cb(err);
    }

    wos.api(config.archiveAppId, method, params, (chunk) => {
      const data = JSON.parse(chunk);
      const rs = data.Result;

      if (data.Status === 0) {
        return cb && cb(null, rs);
      }
      return cb && cb({ code: data.Status, message: data.errMsg });
    }, 'GET', '', ticket, true);
  });
}


service.listArchiveTask = (params, cb) => {
  accessWebosApi('FindArchiveTask', {
    State: params.status,
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.changeArchiveTaskState = (params, cb) => {
  accessWebosApi('ChangeArchiveTaskState', {
    State: params.status,
    Id: params.id,
  }, cb);
};

service.FindArchiveTaskByObjectId = (params, cb) => {
  accessWebosApi('FindArchiveTaskByObjectId', {
    objectId: params.objectId,
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.FindArchiveTaskByTaskName = (params, cb) => {
  accessWebosApi('FindArchiveTaskByTaskName', {
    TaskName: params.taskName,
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.FindDownloadTask = (params, cb) => {
  accessWebosApi('FindDownloadTask', {
    State: params.status,
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.FindDownloadTaskByTaskName = (params, cb) => {
  accessWebosApi('FindDownloadTaskByTaskName', {
    TaskName: params.taskName,
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.ChangeDownloadTaskState = (params, cb) => {
  accessWebosApi('ChangeDownloadTaskState', {
    State: params.status,
    Id: params.id,
  }, cb);
};

service.FindAllClient = (params, cb) => {
  accessWebosApi('FindAllClient', {
    Page: params.page,
    PageSize: params.pageSize,
  }, cb);
};

service.FindClient = (params, cb) => {
  accessWebosApi('FindClient', {
    Id: params.id,
  }, cb);
};

service.RemoveClient = (params, cb) => {
  accessWebosApi('RemoveClient', {
    Id: params.id,
  }, cb);
};

service.AddClient = (params, cb) => {
  accessWebosApi('AddClient', {
    Id: params.id,
    Ip: params.ip,
    State: params.status,
    Description: params.description,
  }, cb);
};

service.UpdateClient = (params, cb) => {
  accessWebosApi('UpdateClient', {
    Id: params.id,
    Ip: params.ip,
    State: params.status,
    Description: params.description,
  }, cb);
};

service.BatchUpdateClientState = (params, cb) => {
  accessWebosApi('BatchUpdateClientState', {
    Ids: params.ids,
    State: params.status,
  }, cb);
};

service.SearchUdsKeyByObjectIDList = (params, cb) => {
  accessWebosApi('SearchUdsKeyByObjectIDList', {
    Ids: params.ids,
  }, cb);
};

service.ManualCreateDownloadTask = (params, cb) => {
  accessWebosApi('ManualCreateDownloadTask', {
    Ids: params.ids,
    Path: params.path,
  }, cb);
};

module.exports = service;
