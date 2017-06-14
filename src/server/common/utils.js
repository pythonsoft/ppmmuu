/**
 * Created by chaoningx on 2017/2/27.
 */
const crypto = require('crypto');
const os = require('os');

let Utils = {};

Utils.isEmptyObject = function(obj) {
  // null and undefined are 'empty'
  if (obj == null || typeof obj == 'undefined') return true;

  // Assume if it has a length property with a non-zeo value
  if (obj.length && obj.length > 0) return false;
  if (obj.length === 0) return true;

  // Otherwise, does it have any properties of its own?
  // Note that this doesn't handle toString and valueOf enumeration bugs in IE < 9
  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

Utils.merge = function(source, target) {
  if(Utils.isEmptyObject(target)) { return source };
  if(Utils.isEmptyObject(source)) {
    if(typeof source == 'string') {
      return '';
    }

    return {};
  };

  let s = Object.assign({}, source);

  for(let k in s) {
    if(target[k]) {
      s[k] = target[k];
    }
  }

  return s;
};

Utils.cipher = function(str, password) {
  let cipher = crypto.createCipher('aes-256-cbc', password);
  let crypted = cipher.update(str,'utf8','hex');
  crypted += cipher.final('hex');
  return crypted;
};

Utils.decipher = function (str, password) {
  let decipher = crypto.createDecipher('aes-256-cbc', password);
  let dec = decipher.update(Buffer(str,'hex'),'utf8');
  dec += decipher.final('utf8');
  return dec;
};

Utils.trim = function(obj) {
  if(typeof obj == 'string') {
    return obj.trim();
  }
  let rs = {};
  for(let t in obj) {
    if(typeof obj[t] == 'string') {
      rs[t] = obj[t].trim();
    }else {
      rs[t] = obj[t];
    }
  }
  return rs;
};


Utils.isEmptyObject = function(obj) {
  if (obj == null || typeof obj == 'undefined') return true;

  if (obj.length && obj.length > 0) return false;
  if (obj.length === 0) return true;

  for (var key in obj) {
    if (hasOwnProperty.call(obj, key)) return false;
  }

  return true;
};

Utils.tpl = function(str, data) {
  for(var item in data) {
    str = str.replace(new RegExp('\{\\$'+ item +'\}', 'gmi'), data[item]);
  }
  str = str.replace(/\{\$(.*?)\}/ig, '');
  return str;
};

Utils.analysisNetworkInterfaces = function () {
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

Utils.result = function(code, data, message=null){
  if(code === '0'){
    message = 'ok';
  }
  return { status: code, data: data, statusInfo: { message: message}};
}

Utils.err = function(code, message){
  return {code: code, message: message};
}

module.exports = Utils;
