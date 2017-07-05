/**
 * Created by steven on 2017/6/28.
 */

'use strict';

const log4js = require('log4js');
const config = require('../config');
const path = require('path');

const logPath = config.logPath;

log4js.configure({
  appenders: [
    { type: 'console' }, // 控制台输出，只在开发模式下使用此部分
    {
      type: 'dateFile', // 文件输出
      absolute: true,
      filename: path.join(logPath, 'access.log'),
      pattern: '-yyyy-MM-dd',
      alwaysIncludePattern: true,
      category: 'access',
    },
    {
      type: 'dateFile', // 文件输出
      absolute: true,
      filename: path.join(logPath, 'error.log'),
      pattern: '-yyyy-MM-dd',
      alwaysIncludePattern: true,
      category: 'error',
    },
  ],
  levels: {
    error: 'ERROR', // 只记录错误级别的信息
  },
});

const loggerCreator = function loggerCreator(name) {
  return log4js.getLogger(name);
};

module.exports = loggerCreator;
