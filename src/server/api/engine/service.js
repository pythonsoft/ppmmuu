/**
 * Created by chaoningx on 2017/7/17.
 */

'use strict';

const logger = require('../../common/log')('error');
const utils = require('../../common/utils');
const config = require('../../config');
const i18n = require('i18next');

const EngineGroupInfo = require('./engineGroupInfo');

const engineGroupInfo = new EngineGroupInfo();

const EngineInfo = require('./engineInfo');

const engineInfo = new EngineInfo();
const SocketClient = require('./client');

const sc = new SocketClient(config.engineCenter);

sc.connect();

const service = {};

/* group */

service.listGroup = function listGroup(parentId, page, pageSize, sortFields, fieldsNeed, cb, isIncludeChildren) {
  const q = {};

  q.parentId = parentId || '';

  engineGroupInfo.pagination(q, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (isIncludeChildren && docs.docs.length !== 0) {
      const ids = [];

      for (let i = 0, len = docs.docs.length; i < len; i++) {
        ids.push(docs.docs[i]._id);
      }

      let cursor = engineGroupInfo.collection.find({ parentId: { $in: ids } });

      if (fieldsNeed) {
        const fields = utils.formatSortOrFieldsParams(fieldsNeed, false);
        fields.parentId = 1;
        cursor = cursor.project(fields);
      }

      cursor.toArray((err, childrenInfo) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        for (let i = 0, len = docs.docs.length; i < len; i++) {
          docs.docs[i].children = null;
          for (let j = 0, l = childrenInfo.length; j < l; j++) {
            if (docs.docs[i]._id === childrenInfo[j].parentId) {
              if (!docs.docs[i].children) {
                docs.docs[i].children = [];
              }
              docs.docs[i].children.push(childrenInfo[j]);
            }
          }
        }

        return cb && cb(null, docs);
      });
    } else {
      return cb && cb(null, docs);
    }
  }, sortFields, fieldsNeed);
};

service.listChildGroup = function listChildGroup(id, fields, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  const q = {};

  if (id.constructor === Array) {
    q.parentId = { $in: id };
  } else {
    q.parentId = id;
  }

  let cursor = engineGroupInfo.collection.find(q);

  if (fields) {
    cursor = cursor.project(utils.formatSortOrFieldsParams(fields));
  }

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getGroup = function getGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  engineGroupInfo.collection.findOne({ _id: id }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('engineGroupInfoIsNull'));
    }

    return cb && cb(null, doc);
  });
};

const insertGroup = function insertGroup(info, cb) {
  engineGroupInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.addGroup = function addGroup(info, cb) {
  if (info.parentId) {
    engineGroupInfo.collection.findOne({ _id: info.parentId }, { fields: { _id: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('parentEngineGroupInfoIsNull'));
      }

      insertGroup(info, cb);
    });
  } else {
    insertGroup(info, cb);
  }
};

service.updateGroup = function updateGroup(id, updateDoc = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  if (!updateDoc.modifyTime) {
    updateDoc.modifyTime = new Date();
  }

  engineGroupInfo.updateOne({ _id: id }, updateDoc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.deleteGroup = function deleteGroup(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineGroupIdIsNull'));
  }

  engineGroupInfo.collection.findOne({ _id: id }, { fields: { _id: 1, deleteDeny: 1, type: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('engineGroupInfoIsNull'));
    }

    if (doc.deleteDeny === EngineGroupInfo.DELETE_DENY.YES) {
      return cb && cb(i18n.t('engineGroupDeleteDenyIsYes'));
    }

    if (doc.type === EngineGroupInfo.TYPE.SYSTEM) {
      return cb && cb(i18n.t('systemEngineGroupCannotDelete'));
    }

    engineGroupInfo.collection.removeOne({ _id: doc._id }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      engineGroupInfo.collection.update({ parentId: doc._id }, { $set: { parentId: '' } }, (err) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseError'));
        }

        engineInfo.collection.update({ groupId: doc._id }, { $set: { groupId: '' } }, (err, r) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, r);
        });
      });
    });
  });
};

/* engine */
const insertEngine = function insertGroup(info, cb) {
  engineInfo.insertOne(info, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.addEngine = function addEngine(info, cb) {
  if (info.groupId) {
    engineGroupInfo.collection.findOne({ _id: info.groupId }, { fields: { _id: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('parentEngineGroupInfoIsNull'));
      }

      insertEngine(info, cb);
    });
  } else {
    insertEngine(info, cb);
  }
};

service.listEngine = function listEngine(keyword, groupId, page, pageSize, sortFields, fieldsNeed, cb) {
  const query = {};

  if (keyword) {
    query.$or = [
      { _id: { $regex: keyword, $options: 'i' } },
      { name: { $regex: keyword, $options: 'i' } },
      { ip: { $regex: keyword, $options: 'i' } },
      { intranetIp: { $regex: keyword, $options: 'i' } },
    ];
  }

  if (groupId) {
    query.groupId = groupId;
  }

  engineInfo.pagination(query, page, pageSize, (err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  }, sortFields, fieldsNeed);
};

service.getEngine = function getEngine(id, fieldsNeed, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineInfoIdIsNull'));
  }

  let options = {};

  if (fieldsNeed) {
    options = { fields: utils.formatSortOrFieldsParams(fieldsNeed, false) };
  }

  engineInfo.collection.findOne({ _id: id }, options, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, doc);
  });
};

const engineUpdate = function engineUpdate(id, updateDoc, cb) {
  console.log('updateDoc -->', updateDoc);
  engineInfo.updateOne({ _id: id }, updateDoc, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

service.updateEngine = function updateEngine(id, updateDoc = {}, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineInfoIdIsNull'));
  }

  if (updateDoc.modifyTime) {
    updateDoc.modifyTime = new Date();
  }

  if (updateDoc.groupId) {
    engineGroupInfo.collection.findOne({ _id: updateDoc.groupId }, { fields: { _id: 1, groupId: 1 } }, (err, doc) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!doc) {
        return cb && cb(i18n.t('engineGroupInfoIsNull'));
      }

      delete updateDoc.configuration;

      engineUpdate(id, updateDoc, (err, r) => cb && cb(err, r));
    });
  } else {
    engineUpdate(id, updateDoc, cb);
  }
};

service.deleteEngine = function deleteEngine(id, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineInfoIdIsNull'));
  }

  engineInfo.collection.removeOne({ _id: id }, (err, r) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, r);
  });
};

/**
 * 更新引擎的配置项
 * @param id
 * @param configs
 * @param cb
 */
service.updateEngineConfiguration = function updateEngineConfiguration(id, configs, cb) {
  if (!id) {
    return cb && cb(i18n.t('engineInfoIdIsNull'));
  }

  if (!configs) {
    return cb && cb(i18n.t('engineConfigurationCanNotBeNull'));
  }

  try {
    const infos = JSON.parse(configs);
    const configurations = [];

    if (infos.constructor !== Array) {
      return cb && cb(i18n.t('engineConfigurationParseError'));
    }

    let info = null;

    for (let i = 0, len = infos.length; i < len; i++) {
      info = infos[i];
      if (!info.key || typeof info.value === 'undefined') {
        return cb && cb(i18n.t('engineConfigurationParseError'));
      }

      configurations.push({ key: (`${info.key}`).trim(), value: info.value, description: info.description || '' });
    }

    engineInfo.updateOne({ _id: id }, { configuration: configurations }, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, r);
    });
  } catch (e) {
    return cb && cb(i18n.t('engineConfigurationParseError'));
  }
};

/* 进程 */
service.listProcess = function listProcess(ip, cb) {
  if (!ip) {
    return cb && cb(i18n.t('engineIdCanNotBeNull'));
  }

  // todo
  const docs = [
    { pid: '8856', status: '运行中', name: '/System/Library/PrivateFrameworks/MobileDevice.framework/Versions/A/Resources/usbmuxd -launchd', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '14044', status: '运行中', name: '/System/Library/PrivateFrameworks/GenerationalStorage.framework/Versions/A/Support/revisiond', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '29584', status: '运行中', name: '/System/Library/PrivateFrameworks/ApplePushService.framework/apsd', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '95332', status: '运行中', name: '/System/Library/CoreServices/loginwindow.app/Contents/MacOS/loginwindow console', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '11060', status: '运行中', name: '/System/Library/CoreServices/coreservices', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '25000', status: '运行中', name: '/System/Library/Frameworks/CoreMediaIO.framework/Resources/VDC.plugin/Contents/Resources/VDCAssistant', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '11848', status: '运行中', name: '/System/Library/Frameworks/CoreTelephony.framework/Support/CommCenter -L', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '14044', status: '运行中', name: '/System/Library/PrivateFrameworks/GenerationalStorage.framework/Versions/A/Support/revisiond', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '25860', status: '运行中', name: '/usr/libexec/locationd', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
    { pid: '47192', status: '运行中', name: '/usr/libexec/coreduetd', cpu: '10%', memory: '12%', disk: '10%', net: '2%', runTime: '400小时' },
  ];

  console.log('ip', ip);

  sc.socket.emit('action', { ip, action: 'ps', name: 'web', process: '' }, (err, result) => cb && cb({ message: err }, result));

  // return cb && cb(null, docs);
};

service.listAction = function listAction(processId, cb) {
  if (!processId) {
    return cb && cb(i18n.t('processIdCanNotBeNull'));
  }

  const docs = [
    { ps_node: { name: 'ps_node', command: 'ps aux | grep node', description: '显示所有的node进程' } },
    { ps_java: { name: 'ps_java', command: 'ps aux | grep java', description: '显示所有的java进程' } },
    { ps_php: { name: 'ps_php', command: 'ps aux | grep php', description: '显示所有的php进程' } },
  ];

  // processId or process name from config
  sc.socket.emit('action', { ip, action: 'getActions', process: '' }, (err, result) => cb && cb({ message: err }, result));

  return cb && cb(null, docs);
};

service.emitAction = function emitAction(engineId, processId, action, cb) {
  if (!engineId) {
    return cb && cb(i18n.t('engineIdCanNotBeNull'));
  }

  if (!processId) {
    return cb && cb(i18n.t('processIdCanNotBeNull'));
  }

  if (!action) {
    return cb && cb(i18n.t('processActionCanNotBeNull'));
  }

  sc.socket.emit('action', { ip, action, process: '' }, (err, result) => cb && cb({ message: err }, result));

  return cb && cb(null, 'ok');
};

service.installMonitor = function installMonitor(ip, cb) {
  if (!ip) {
    return cb && cb(i18n.t('engineIdCanNotBeNull'));
  }

  sc.socket.emit('setup', { username: 'root', host: ip, password: '4pstvmis' }, (err, stdout, stderr) => {
    console.log('setup --->', err, stdout, stderr);
    //todo
    return cb && cb(null, 'ok');
  });

};

module.exports = service;
