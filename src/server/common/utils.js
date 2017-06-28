/**
 * Created by chaoningx on 2017/2/27.
 */
const crypto = require('crypto');
const os = require('os');

let utils = {};

utils.isEmptyObject = function(obj) {
  if (obj === null || typeof obj === 'undefined') return true;

  if (obj.length && obj.length > 0) return false;
  if (obj.length === 0) return true;

  for(let key in obj) {
    if(hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

utils.merge = function(source, target) {
  if(utils.isEmptyObject(target)) { return source }
  if(utils.isEmptyObject(source)) {
    if (typeof source === 'string') {
      return '';
    }

    return {};
  }

  let s = Object.assign({}, source);

  for(let k in s) {
    if(target[k]) {
      s[k] = target[k];
    }
  }

  return s;
};

utils.cipher = function(str, password) {
  let cipher = crypto.createCipher('aes-256-cbc', password);
  let crypted = cipher.update(str,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

utils.decipher = function (str, password) {
  let decipher = crypto.createDecipher('aes-256-cbc', password);
  let dec = decipher.update(Buffer.from(str,'hex'), 'utf8');
  dec += decipher.final('utf8');
  return dec;
};

utils.trim = function(obj) {
  if(typeof obj === 'string') {
    return obj.trim();
  }
  let rs = {};

  if(typeof obj === 'array') {
    rs = [];
    for(let i = 0, len = obj.length; i < len; i++) {
      if(typeof obj[i] === 'string') {
        rs.push(obj[i].trim());
      }else {
        rs.push(obj[i]);
      }
    }

    return rs;
  }

  for(let t in obj) {
    if(typeof obj[t] === 'string') {
      rs[t] = obj[t].trim();
    }else {
      rs[t] = obj[t];
    }
  }
  return rs;
};

utils.tpl = function(str, data) {
  for(let item in data) {
    str = str.replace(new RegExp('\{\\$'+ item +'\}', 'gmi'), data[item]);
  }
  str = str.replace(/\{\$(.*?)\}/ig, '');
  return str;
};

utils.analysisNetworkInterfaces = function () {
  const nf = os.networkInterfaces();
  let ips = [];
  for(let k in nf) {
    let n = nf[k];
    for(let i = 0, len = n.length; i < len; i++) {
      if(n[i].address && /^[0-9.]{1,20}$/.exec(n[i].address)) {
        ips.push(n[i].address);
      }
    }
  }

  return ips;
};

utils.err = function(code, message) {
  return { code: code, message: message };
};

utils.checkEmail = function(email) {
  if((email.length > 128) || (email.length < 6)) {
    return false;
  }
  return !!email.match(/^[A-Za-z0-9+]+[A-Za-z0-9\.\_\-+]*@([A-Za-z0-9\-]+\.)+[A-Za-z0-9]+$/);
};

/**
 * 2-20位有效字符
 * @param name
 * @returns {boolean}
 */
utils.checkVipName = function(name) {
  return /^[0-9a-zA-Z_\u4e00-\u9fa5]{2,20}$/.test(name);
};

utils.checkPassword = function(password) {
  return /^[0-9a-zA-Z_]{6,20}$/.test(password);
};

module.exports = utils;
