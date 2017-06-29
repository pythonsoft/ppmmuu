/**
 * Created by steven on 2017/6/28.
 */
const log4js = require('log4js');
const path = require('path');
const logPath = path.join(__dirname, 'log');

log4js.configure({
  appenders: [
    { type: 'console' }, //控制台输出，只在开发模式下使用此部分
    {
      type: 'dateFile', //文件输出
      absolute: true,
      filename: path.join(logPath, 'access.log'),
      pattern: "-yyyy-MM-dd",
      alwaysIncludePattern: true,
      category: 'access',
    },
    {
      type: 'dateFile', //文件输出
      absolute: true,
      filename: path.join(logPath, 'error.log'),
      pattern: "-yyyy-MM-dd",
      alwaysIncludePattern: true,
      category: 'error',
    },
    {
      type: 'dateFile', //文件输出
      absolute: true,
      filename: path.join(logPath, 'mqCountError.log'),
      pattern: "-yyyy-MM-dd",
      alwaysIncludePattern: true,
      category: 'mqCountError',
    }
  ],
  levels: {
    error: 'ERROR' //只记录错误级别的信息
  }
});

const loggerCreator = function(name) {
  return log4js.getLogger(name);
};

module.exports = loggerCreator;