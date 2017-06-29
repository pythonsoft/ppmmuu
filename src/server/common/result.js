/**
 * Created by steven on 2017/6/14.
 */
let result = {};
const logger = require('../common/log')('error');

const build = function(code, data, message=null) {
  if(code === '0') {
    message = 'ok';
  }

  return { status: code, data: data, statusInfo: { message: message }};
};

result.success = function(data, message='ok') {
  return build('0', data, message);
};

result.fail = function(err, data = {}) {
  return build(err.code, data, err.message);
};

result.json = function(err, rs, log4jContent) {
  if(err) {
    if(log4jContent) {
      logger.error(log4jContent);
    }
    return result.fail(err);
  }

  return result.success(rs);
};

module.exports = result;
