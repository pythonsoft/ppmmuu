/**
 * Created by steven on 17/5/12.
 */

'use strict';

const logger = require('../../common/log')('error');
const i18n = require('i18next');
const utils = require('../../common/utils');
const Token = require('../../common/token');
const WebosApi = require('../../common/webosAPI');
const config = require('../../config');
const Login = require('../../middleware/login');

const jwt = require('jsonwebtoken');

const SearchHistoryInfo = require('./searchHistoryInfo');
const WatchingHistoryInfo = require('./watchingHistoryInfo');
const UserInfo = require('./userInfo');
const PermissionGroup = require('../role/permissionGroup');
const GroupInfo = require('../group/groupInfo');

const userInfo = new UserInfo();
const searchHistoryInfo = new SearchHistoryInfo();
const watchingHistoryInfo = new WatchingHistoryInfo();
const permissionGroup = new PermissionGroup();
const groupInfo = new GroupInfo();

const groupService = require('../group/service');
const groupUserService = require('../group/userService');
const subscribeService = require('../subscribe/service');

const service = {};

const generateToken = function generateToken(id, expires) {
  const exp = expires || new Date().getTime() + config.cookieExpires;
  const token = Token.create(id, exp, config.KEY);

  return token;
};

const getMenuByPermissions = function getMenuByPermissions(permissions, cb) {
  if (permissions.length === 0) {
    return cb && cb(null, []);
  }
  const indexes = [];
  for (let i = 0, len = permissions.length; i < len; i++) {
    if (permissions[i].action !== '拒绝') {
      indexes.push(permissions[i].groupIndex);
    }
  }
  service.getMenusByIndex(indexes, (err, menu) => cb && cb(err, menu));
};

/**
 * 设置登录的token
 * @param res
 * @param doc userInfo
 * @param cb
 */
function setCookie2(res, doc, cb) {
  const expires = new Date().getTime() + config.cookieExpires;
  const token = generateToken(doc._id, expires);

  const jwtToken = jwt.sign({
    service: 'bd-bigdata',
  }, config.KEY, {
    expiresIn: expires,
  });

  Login.getUserInfo(doc._id, (err, info) => {
    if (err) {
      return cb && cb(i18n.t('loginCannotGetUserInfo'));
    }

    const permissions = info.permissions || [];
    getMenuByPermissions(permissions, (err, menu) => {
      if (err) {
        return cb && cb(err);
      }

      res.cookie('ticket', token, {
        expires: new Date(expires),
        httpOnly: true,
      });

      delete info.permissions;
      delete info.mediaExpressUser;

      subscribeService.hasSubscribeInfo(doc.company._id, (err, isExist) => {
        if (err) {
          return cb && cb(err);
        }
        if (isExist) {
          menu.push({
            _id: 'subscriptions',
            name: '订阅',
            index: 'subscriptions',
            parentIndex: '',
          });
        }
        return cb && cb(null, {
          token,
          menu,
          userInfo: info,
          jwtToken,
        });
      });
    });
  });
}

function webosLogin(userId, password, cb) {
  const wos = new WebosApi(config.WEBOS_SERVER);
  wos.getTicket(userId, password, (err, r) => {
    if (err) {
      return cb && cb(err);
    }
    const iL = WebosApi.decryptTicket(r, config.WEBOS_SERVER.key);
    if (iL[0] === userId) {
      return cb && cb(null, r);
    }
    return cb && cb('email not matched');
  });
}

function saveWebosTicket(userId, ticket, cb) {
  userInfo.updateOne({ _id: userId }, { webosTicket: ticket }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null);
  });
}

const loginHandle = function loginHandle(username, password, cb) {
  const cipherPassword = utils.cipher(password, config.KEY);

  if (username.indexOf('@') === -1) {
    username = `${username}@phoenixtv.com`;
  }

  if (!utils.checkEmail(username)) {
    return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
  }

  const query = {
    email: username,
  };

  userInfo.collection.findOne(query, {
    fields: {
      _id: 1,
      password: 1,
      verifyType: 1,
      expiredTime: 1,
      company: 1,
      email: 1,
      createdTime: 1,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
    }

    service.registerUserToEaseMob(doc, () => {
      if (UserInfo.VERIFY_TYPE.PASSWORD === doc.verifyType) {
        if (doc.expiredTime < new Date()) {
          return cb && cb(i18n.t('userExpiredTime'));
        }

        if (cipherPassword !== doc.password) {
          return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
        }
        return cb && cb(null, doc);
      } else if (UserInfo.VERIFY_TYPE.WEBOS === doc.verifyType) {
        webosLogin(username, password, (err, webosTicket) => {
          if (err) {
            return cb && cb(i18n.t('usernameOrPasswordIsWrong'));
          }
          saveWebosTicket(doc._id, webosTicket, (err) => {
            if (err) {
              return cb && cb(err);
            }
            return cb && cb(null, doc);
          });
        });
      } else {
        return cb && cb(i18n.t('notImplementedVerityType'));
      }
    });
  });
};

const loginHandleByTicket = function loginHandle(ticket, cb) {
  const decodeTicketResult = service.decodeTicket(ticket);

  if (decodeTicketResult.err) {
    return cb && cb(decodeTicketResult.err);
  }

  const decodeTicket = decodeTicketResult.result;

  const query = {
    _id: decodeTicket[0],
  };

  userInfo.collection.findOne(query, {
    fields: {
      _id: 1,
      verifyType: 1,
      expiredTime: 1,
      company: 1,
      email: 1,
      createdTime: 1,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    if (doc.expiredTime < new Date()) {
      return cb && cb(i18n.t('userExpiredTime'));
    }

    service.registerUserToEaseMob(doc, (err) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, doc);
    });
  });
};

service.decodeTicket = function decodeTicket(ticket) {
  const dt = Token.decipher(ticket, config.KEY);
  const rs = { err: '', result: '' };

  if (!dt) {
    rs.err = i18n.t('notLogin');
    return rs;
  }

  const now = new Date().getTime();

  if (dt[1] < now) { // 过期
    rs.err = i18n.t('loginExpired');
    return rs;
  }

  rs.result = dt;

  return rs;
};

service.login = function login(res, username, password, cb) {
  loginHandle(username, password, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    setCookie2(res, doc, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, doc);
    });
  });
};

service.loginByTicket = function loginByTicket(res, ticket, cb) {
  // doc --> userInfo;
  loginHandleByTicket(ticket, (err, doc) => {
    if (err) {
      return cb && cb(err);
    }

    setCookie2(res, doc, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      return cb && cb(null, doc);
    });
  });
};

service.setCookie = function setCookie(res, id) {
  const expires = Date.now() + config.cookieExpires;
  const token = Token.create(id, expires, config.KEY);

  res.cookie('ticket', token, {
    expires: new Date(expires),
    httpOnly: true,
  });

  return token;
};

service.getUserDetail = function getUserDetail(_id, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  userInfo.collection.findOne({
    _id,
  }, {
    fields: {
      password: 0,
    },
  }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }
    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    groupUserService.getUserGroups(doc, cb);
  });
};

service.updateUser = function updateUser(_id, info, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  const updateInfo = utils.getAllowedUpdateObj('name,displayName,phone,email,photo', info);

  userInfo.collection.updateOne({
    _id,
  }, {
    $set: updateInfo,
  }, (err) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, 'ok');
  });
};

service.logout = function logout(_id, res, cb) {
  if (!_id) {
    return cb && cb(i18n.t('userIdIsNull'));
  }

  res.cookie('ticket', '');
  config.redisClient.del([_id]);
  return cb && cb(null, 'ok');
};

service.changePassword = function changePassword(info, res, cb) {
  const _id = info._id;
  if (!info.password || !utils.checkPassword(info.password)) {
    return cb && cb(i18n.t('oldPasswordIsNotCorrect'));
  }
  if (!info.newPassword || !utils.checkPassword(info.newPassword)) {
    return cb && cb(i18n.t('newPasswordIsNotCorrect'));
  }
  if (info.newPassword !== info.confirmNewPassword) {
    return cb && cb(i18n.t('confirmNewPasswordIsNotCorrect'));
  }

  userInfo.collection.findOne({ _id }, { fields: { password: 1 } }, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    if (!doc) {
      return cb && cb(i18n.t('userNotFind'));
    }

    if (utils.cipher(info.password, config.KEY) !== doc.password) {
      return cb && cb(i18n.t('oldPasswordIsNotCorrect'));
    }

    const password = utils.cipher(info.newPassword, config.KEY);
    if (password === doc.password) {
      return cb && cb(i18n.t('newPasswordIsSameWithOldPassword'));
    }

    userInfo.collection.updateOne({ _id }, { $set: { password } }, (err) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }
      service.logout(_id, res, cb);
    });
  });
};

service.removeWatchHistory = (ids, userId, cb) => {
  const filter = {};
  if (userId) {
    filter.userId = userId;
  } else {
    if (!ids) {
      return cb && cb(i18n.t('idIsNull'));
    }
    filter._id = { $in: ids.split(',') };
  }
  watchingHistoryInfo.collection.deleteMany(filter, null, (err, r) => cb && cb(err, r));
};

service.removeSearchHistory = (ids, userId, cb) => {
  const filter = {};
  if (userId) {
    filter.userId = userId;
  } else {
    if (!ids) {
      return cb && cb(i18n.t('idIsNull'));
    }
    filter._id = { $in: ids.split(',') };
  }
  searchHistoryInfo.collection.deleteMany(filter, null, (err, r) => cb && cb(err, r));
};

const getGroupByNameOrCreate = function getGroupByNameOrCreate(query, cb) {
  groupInfo.collection.findOne(query, (err, doc) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }
    if (doc) {
      return cb && cb(null, doc);
    }

    groupService.addGroup(query, (err, doc) => {
      if (err) {
        return cb && cb(err);
      }

      if (!doc) {
        return cb && cb(i18n.t('createCompanyFailed'));
      }

      return cb && cb(null, doc);
    });
  });
};

const getGroupsByNamesOrCreate = function getGroupsByNamesOrCreate(names, cb) {
  groupInfo.collection.find({ name: { $in: names }, type: GroupInfo.TYPE.COMPANY, parentId: '' }).toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
    }
    const rs = {};
    const insertNames = JSON.parse(JSON.stringify(names));
    if (docs) {
      const len = docs.length;
      for (let i = 0; i < len; i++) {
        const doc = docs[i];
        const index = insertNames.indexOf(doc.name);
        rs[doc.name] = doc._id;
        if (index !== -1) {
          insertNames.splice(index, 1);
        }
      }
      if (len === names.length) {
        return cb && cb(null, rs);
      }
    }

    const infos = [];
    for (let j = 0, len1 = insertNames.length; j < len1; j++) {
      const info = {
        type: GroupInfo.TYPE.COMPANY,
        name: insertNames[j],
        parentId: '',
      };
      infos.push(info);
    }
    groupInfo.insertMany(infos, (err, r) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
      }
      const newGroups = r.ops || [];
      for (let k = 0, len2 = newGroups.length; k < len2; k++) {
        rs[newGroups[k].name] = newGroups[k]._id;
      }
      return cb && cb(null, rs);
    });
  });
};

/**
 * 同步AD账户
 * @param info
 * @param cb
 * @returns {*}
 */
service.adAccountSync = function adAccountSync(info, cb) {
  if (!info.verifyType) {
    info.verifyType = UserInfo.VERIFY_TYPE.AD;
  }

  if (!info._id) {
    return cb && cb(i18n.t('fieldIsNotExistError', { field: '_id' }));
  }

  if (!info.companyName) {
    return cb && cb(i18n.t('fieldIsNotExistError', { field: 'companyName' }));
  }

  const companyName = utils.trim(info.companyName);

  const result = userInfo.assign(info);

  if (result.err) {
    return cb & cb(result.err);
  }

  const doc = result.doc;

  const getDepartmentInfo = function getDepartmentInfo(departmentName, info, callback) {
    if (!departmentName) {
      return callback && callback(null, null);
    }

    getGroupByNameOrCreate(info, (err, r) => {
      if (err) {
        return callback && callback(err);
      }
      return callback && callback(null, r);
    });
  };

  getGroupByNameOrCreate({ name: companyName, type: GroupInfo.TYPE.COMPANY }, (err, r) => {
    if (err) {
      return cb && cb(err);
    }

    if (!doc.company) {
      doc.company = { _id: '', name: '' };
    }

    doc.company._id = r._id;
    doc.company.name = r.name;

    let departmentName = info.departmentName || '';
    departmentName = departmentName.trim();
    const departmentInfo = {
      name: departmentName,
      type: GroupInfo.TYPE.DEPARTMENT,
      parentId: r._id,
    };

    getDepartmentInfo(departmentName, departmentInfo, (err, dept) => {
      if (err) {
        return cb && cb(err);
      }
      if (dept) {
        if (!doc.department) {
          doc.department = { _id: '', name: '' };
        }

        doc.department._id = dept._id;
        doc.department.name = dept.name;
      }
      userInfo.collection.findOne({ _id: info._id }, (err, user) => {
        if (err) {
          logger.error(err.message);
          return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
        }
        if (user) {
          if (doc.department && !doc.department._id) {
            delete doc.department;
          }
          userInfo.collection.updateOne({ _id: info._id }, { $set: doc }, (err) => {
            if (err) {
              logger.error(err.message);
              return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
            }

            return cb && cb(null, 'ok');
          });
        } else {
          userInfo.collection.insertOne(doc, (err) => {
            if (err) {
              logger.error(err.message);
              return cb && cb(i18n.t('databaseErrorDetail', { error: err.message }));
            }

            return cb && cb(null, 'ok');
          });
        }
      });
    });
  });
};

service.batchAdAccountSync = function batchAdAccountSync(infos, cb) {
  if (!infos || infos.constructor.name.toLowerCase() !== 'array') {
    return cb && cb(i18n.t('infosNotCorrect'));
  }
  const loopSync = function loopSync(index) {
    if (index >= infos.length) {
      return cb && cb(null, 'ok');
    }
    service.adAccountSync(infos[index], (err) => {
      if (err) {
        return cb && cb(err);
      }
      loopSync(index + 1);
    });
  };
  loopSync(0);
};

service.getDirectAuthorizeAcceptorList = function getDirectAuthorizeAcceptorList(_id, cb) {
  userInfo.collection.findOne({ _id }, (err, user) => {
    if (err) {
      return cb && cb(i18n.t('databaseError'));
    }

    if (!user) {
      return cb && cb(i18n.t('userNotFind'));
    }

    const mediaExpressUser = user.mediaExpressUser;
    if (!mediaExpressUser.username) {
      return cb && cb(i18n.t('unBindMediaExpressUser'));
    }
    const loginForm = {
      email: mediaExpressUser.username,
      password: mediaExpressUser.password,
    };

    let url = `${config.mediaExpressUrl}login`;
    utils.requestCallApiGetCookie(url, 'POST', loginForm, '', (err, cookie) => {
      if (err) {
        return cb && cb(err);
      }
      if (!cookie) {
        return cb && cb(i18n.t('bindMediaExpressUserNeedRefresh'));
      }

      url = `${config.mediaExpressUrl}directAuthorize/acceptorList?t=${new Date().getTime()}`;
      utils.requestCallApi(url, 'GET', '', cookie, (err, rs) => {
        if (err) {
          return cb && cb(err);
        }
        if (rs.status !== 0) {
          return cb && cb(i18n.t('requestCallApiError', { error: rs.result }));
        }

        return cb && cb(null, rs.result);
      });
    });
  });
};

service.getMenusByIndex = function getMenusByIndex(indexArr, cb) {
  const query = {};
  const arr = [];
  const loopGetPermissionGroup = function loopGetPermissionGroup(query) {
    permissionGroup.collection.find(query).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      if (!docs || docs.length === 0) {
        permissionGroup.collection.find({ index: { $in: arr } }).toArray((err, docs) => {
          if (err) {
            logger.error(err.message);
            return cb && cb(i18n.t('databaseError'));
          }

          return cb && cb(null, docs);
        });
      } else {
        const parentIndexes = [];
        for (let i = 0, len = docs.length; i < len; i++) {
          parentIndexes.push(docs[i].parentIndex);
          arr.push(docs[i].index);
        }
        loopGetPermissionGroup({ index: { $in: parentIndexes } });
      }
    });
  };

  if (indexArr.indexOf('root') === -1) {
    query.index = { $in: indexArr };
    loopGetPermissionGroup(query);
  } else {
    permissionGroup.collection.find(query).toArray((err, docs) => {
      if (err) {
        logger.error(err.message);
        return cb && cb(i18n.t('databaseError'));
      }

      return cb && cb(null, docs);
    });
  }
};

service.getUsers = function getUsers(ids, cb) {
  if (!ids) {
    return cb && cb(i18n.t('userIdIsNull'));
  }
  const q = {};

  if (ids.constructor === Array) {
    q._id = { $in: ids };
  } else if (ids.indexOf(',')) {
    q._id = { $in: ids.split(',') };
  } else {
    q._id = ids;
  }

  let cursor = userInfo.collection.find(q);
  const fieldsNeed = '_id,photo,name,email,phone';
  cursor = cursor.project(utils.formatSortOrFieldsParams(fieldsNeed, false));

  cursor.toArray((err, docs) => {
    if (err) {
      logger.error(err.message);
      return cb && cb(i18n.t('databaseError'));
    }

    return cb && cb(null, docs);
  });
};

service.getEaseMobToken = function getEaseMobToken(cb) {
  const info = {
    grant_type: 'client_credentials',
    client_id: config.client_id,
    client_secret: config.client_secret,
  };
  utils.callApi(`${config.easemob_url}token`, 'POST', info, '', (err, rs) => {
    if (err) {
      return cb && cb(err);
    }
    const token = rs ? rs.access_token : '';
    return cb && cb(null, token);
  });
};

service.registerUserToEaseMob = function registerUserToEaseMob(user, cb) {
  if (user.email.indexOf('@phoenixtv.com') === -1) {
    return cb && cb(null, 'ok');
  }
  service.getEaseMobToken((err, token) => {
    if (err) {
      return cb && cb(err);
    }

    const Authorization = `Bearer ${token}`;
    const t = new Date(user.createdTime).toISOString();
    const info = {
      username: user._id.replace(/-/g, '_'),
      password: `${t}`,
    };
    utils.callApi(`${config.easemob_url}users`, 'POST', info, Authorization, err => cb && cb(null, 'ok'));
  });
};

service.detailUsers = function detailUsers(ids, cb) {
  if (!ids) {
    return cb && cb(null, i18n.t('parametersIdsRequired'));
  }

  ids = ids.replace(/_/g, '-');
  ids = ids.split(',');

  service.getUsers(ids, (err, docs) => {
    if (err) {
      return cb && cb(err);
    }

    const rs = {};
    if (docs && docs.length) {
      docs.forEach((item) => {
        rs[item._id] = item;
      });
    }

    return cb && cb(null, rs);
  });
};

module.exports = service;
