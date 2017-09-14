
'use strict';

const http = require('http');
const crypto = require('crypto');
const utils = require('./utils');

// const wos = new webosAPI(config.WEBOS_SERVER);

class webosAPI {
  constructor(settings) {
    this.settings = utils.merge({
      hostname: '',
      port: '',
      key: '',
    }, settings);

    if (!this.settings.key) {
      throw new Error('WebOS key is null.');
    }
  }
  api(module, action, params, callback, method, clientId, ticket) {
    const me = this;
    let url = `/api?app=${module}&method=${action}`;
    const headers = {};

    if (params) {
      const p = [];
      for (const k in params) {
        p.push(`${k}=${encodeURIComponent(params[k])}`);
      }
      url = `${url}&${p.join('&')}`;
    }

    if (ticket) {
      headers['webos-ticket'] = ticket;
    }

    if (clientId) {
      headers['User-Agent'] = clientId;
    } else {
      headers['User-Agent'] = 'Mozilla/5.0 (Windows NT 6.1; WOW64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/33.0.1750.146 Safari/537.36';
    }

    const options = {
      hostname: me.settings.hostname,
      port: me.settings.port,
      path: url,
      method: method || 'GET',
      headers,
    };

    const req = http.request(options, (res) => {
      const buffers = [];
      let len = 0;

      res.on('data', (buf) => {
        len += buf.length;
        buffers.push(buf);
      });

      res.on('end', () => {
        const buffer = Buffer.concat(buffers, len);
        callback && callback(buffer.toString());
      });
    });

    req.on('error', (e) => {
      throw new Error(`problem with request: ${e.message}`, e, e.stack);
      callback && callback({ Status: -1, Result: e.message });
    });

    req.end();
  }
  /**
  * 从webos获取用户的详细信息
  * {
      Id: 'd95ba075-670c-4ce8-8bf3-9f0200b62f9a',
      UserId: 'chaoningx@phoenixtv.com',
      UserName: '謝朝寧',
      Password: '',
      CreateTime: '/Date(1308020599000+0800)/',
      FirstName: 'Xie',
      LastName: 'Chaoning',
      DepartmentId: 'c362001e-4caa-4a3e-b9b9-9f270115ceb6',
      DepartmentName: '信息及网络管理部',
      Title: 'Development Service Officer',
      OfficeDuty: '',
      DisplayName: 'Xie, Chaoning (Phoenix HK)',
      Company: 'Phoenix Satellite Television Co Ltd',
      ChineseName: '謝朝寧',
      Mail: 'chaoningx@phoenixtv.com',
      EmployeeId: '',
      HomeDirectory: '',
      Phone: '',
      Mobile: '',
      Photo: 'd1621e4a-e94f-4ee3-89e7-a19a00da8be9',
      Description: '謝朝寧',
      Status: 0
  }
  * @param ticket webos使用的ticket
  * @param userAgent
  * @param callback
  * @constructor
  */
  profile(callback, userAgent, ticket) {
    this.api('Profile', 'Detail', '', (chunk) => {
      let data = JSON.parse(chunk),
        rs = data.Result;

      if (data.Status == 0) {
        callback && callback(null, rs);
      } else {
        callback && callback(rs);
      }
    }, 'GET', userAgent, ticket);
  }
  /**
   * 从webos获取用户的详细信息
   * {
      Id: 'd95ba075-670c-4ce8-8bf3-9f0200b62f9a',
      UserId: 'chaoningx@phoenixtv.com',
      UserName: '謝朝寧',
      Password: '',
      CreateTime: '/Date(1308020599000+0800)/',
      FirstName: 'Xie',
      LastName: 'Chaoning',
      DepartmentId: 'c362001e-4caa-4a3e-b9b9-9f270115ceb6',
      DepartmentName: '信息及网络管理部',
      Title: 'Development Service Officer',
      OfficeDuty: '',
      DisplayName: 'Xie, Chaoning (Phoenix HK)',
      Company: 'Phoenix Satellite Television Co Ltd',
      ChineseName: '謝朝寧',
      Mail: 'chaoningx@phoenixtv.com',
      EmployeeId: '',
      HomeDirectory: '',
      Phone: '',
      Mobile: '',
      Photo: 'd1621e4a-e94f-4ee3-89e7-a19a00da8be9',
      Description: '謝朝寧',
      Status: 0
  }
   * @param ticket webos使用的ticket
   * @param userAgent
   * @param callback
   * @constructor
   */
  getUserInfo(userId, callback, userAgent, ticket) {
    this.api('Account', 'Get', { UserId: userId }, (chunk) => {
      const data = JSON.parse(chunk);
      const rs = data.Result;

      if (data.Status == 0) {
        callback && callback(null, rs);
      } else {
        callback && callback(rs);
      }
    }, 'GET', userAgent, ticket);
  }

  /**
   * 用于获取webos token,也可以用于登录验证
   * @param userId
   * @param password
   * @param callback
   */
  getTicket(userId, password, callback) {
    if (!userId) {
      callback && callback();
      return;
    }

    const exts = '@phoenixtv.com';

    if (userId.indexOf(exts) == -1) {
      userId += exts;
    }

    this.api('Account', 'Token', { userId, password }, (chunk) => {
      const data = JSON.parse(chunk);
      const rs = data.Result;

      if (data.Status == 0) {
        callback && callback(null, rs);
      } else {
        callback && callback(rs);
      }
    }, 'GET');
  }
  listUserOfRole(appId, name, callback, userAgent) {
    this.api('Security', 'ListUserOfRole', { id: appId, name }, (chunk) => {
      const data = JSON.parse(chunk);
      const rs = data.Result;

      if (data.Status == 0) {
        callback && callback(null, rs);
      } else {
        callback && callback(rs);
      }
    }, 'Get', this.settings.key, userAgent);
  }
  encryptTicket(userId, key) {
    const k = new Buffer(key, 'base64');
    const iv = new Buffer(key, 'base64');
    const str = '{0}\n{1}\n{2}'.replace('{0}', userId).replace('{1}', '1').replace('{2}', `${new Date().getTime() + 2592000000}`); // 30天
    const decipher = crypto.createCipheriv('des', k, iv);
    let txt = decipher.update(str, 'utf8', 'base64');

    txt += decipher.final('base64');

    return txt;
  }
  securityAuthorize(appId, privileges, callback, ticket) {
    this.api('Security', 'Authorize', { id: appId, privileges }, (chunk) => {
      let data = JSON.parse(chunk),
        rs = data.Result;

      if (data.Status == 0) {
        callback && callback(null, rs);
      } else {
        callback && callback(rs);
      }
    }, 'GET', false, ticket);
  }
  static decryptTicket(ticket, key) {
    const k = new Buffer(key, 'base64');
    const iv = new Buffer(key, 'base64');

    let txt = '';

    try {
      const decipher = crypto.createDecipheriv('des', k, iv);
      txt = decipher.update(ticket, 'base64', 'utf8');
      txt += decipher.final('utf8');
    } catch (e) {
      console.error(e);
      return false;
    }

    return txt.split('\n');
  }
}

module.exports = webosAPI;
