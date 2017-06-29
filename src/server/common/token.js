const utils = require('./utils');

let Token = {
  /**
  * 创建一个带过期时间的Token
  * @param key 需要加密的字符器
  * @param expires 到期时间，单位为ms
  * @param security 加密密钥
  * @returns {String} sha1加密字符串
  */
  create: function(key, expires, security) {
    if(arguments.length < 3) {
      throw new Error('Token.create method key,expires and security must exist.');
    }

    const session = key + '-' + expires;
    return utils.cipher(session, security);
  },
  /**
  * 更新Token的过期时间并创建一个新的Token
  * @param token
  * @param expires
  * @param security
  * @returns {*} 如果更新失败将返回false, 否则返回新的Token
  */
  updateExpire: function(token, expires, security) {
    if(arguments.length < 3) {
      return false;
    }

    let decodeSession = utils.decipher(token, security);

    if(decodeSession.indexOf('-') === -1) {
      return false;
    }

    let p = decodeSession.split('-'),
        exp = p[1] * 1,
        now = new Date().getTime();

    if(exp > now) {
      p[1] = now + expires;
      return this.create(p[0], p[1], security);
    }

    return false;
  },
  /**
  * 将token还原, 如果格式不正确，将返回false
  * @param token
  * @param security
  * @returns {Array|Boolean} 如果失败将返回false, 否则返回解密后的Token
  */
  decipher: function(token, security) {
    if(arguments.length < 2) {
      return false;
    }

    let decodeSession = null;

    try {
      decodeSession = utils.decipher(token, security);
    }catch (e){
      return false;
    }

    if(decodeSession.indexOf('-') === -1) {
      return false;
    }

    return decodeSession.split('-');
  }
};

module.exports = Token;
