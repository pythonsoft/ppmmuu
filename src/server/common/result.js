/**
 * Created by steven on 2017/6/14.
 */
let Utils = {};

Utils.SUCCESS = function(data){
  return { status: '0', data: data, statusInfo: { message: 'ok'}};
}

Utils.FAIL = function(code, data, message){
  return { status: code, data: data, statusInfo: { message: message}};
}

module.exports = Utils;