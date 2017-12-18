/**
 * Created by steven on 17/5/5.
 */

'use strict';

const path = require('path');
const fs = require('fs');
const vm = require('vm');
const redis = require('redis');
require('redis-streams')(redis);

const config = {};

config.dbInstance = {};

const configPath = path.join(__dirname, './config_master.js');

config.mongodb = {
  umpURL: 'mongodb://10.0.15.62:27017/ump_v1',
};

config.redis_host = '10.0.15.105';
config.redis_port = 6379;
config.redis_opts = { auth_pass: 'steven' };
config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7; // cookie有效期七天
config.redisExpires = 1 * 60 * 60 * 12; // redis有效期12小时
config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;

config.umpAssistQueueName = 'ump-assist-queue';

config.engineCenter = {
  host: '10.0.15.66',
  port: 3000,
};

config.TRANSCODE_API_SERVER = {
  hostname: '10.0.15.57',
  port: 8090,
};

config.JOB_API_SERVER = {
  hostname: '10.0.15.80',
  port: 8080,
};

config.WEBOS_SERVER = {
  hostname: 'webos.phoenixtv.com',
  port: 80,
  key: 'aXVhbEEpIWM=',
};

const init = function init() {
  const redisClient = redis.createClient(config.redis_port, config.redis_host, config.redis_opts);

  redisClient.on('error', (err) => {
    console.log(`Redis Error: ${err}`);
  });

  redisClient.on('ready', () => {
    console.log('Redis Connect Success!');
  });

  config.redisClient = redisClient;
};

const initRedisMQ = function initRedisMQ() {
  const rsmq = new RedisMQ({ client: config.redisClient, ns: 'rsmq' });
  rsmq.createQueue({ qname: config.umpAssistQueueName }, (err, resp) => {
    if (err) {
      console.log('创建消息队列失败===>', err);
    }
    if (resp === 1) {
      console.log('queue created');
    }
  });
  config.rsmq = rsmq;
};

const readConfig = function readConfig(p) {
  const sandbox = {
    path,
    config,
    __dirname,
    console,
    process,
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(p), sandbox);
};

if (fs.existsSync(configPath)) {
  // 读取生产环境config_master.js文件
  readConfig(configPath);
  init();
} else if (process.env.NODE_ENV === 'development') { // 本地开发环境
  readConfig(path.join(__dirname, './config_master.js'));
  config.host = `localhost:${config.port}`;
  config.domain = `http://${config.host}`;
  init();
  initRedisMQ();
} else {
  throw new Error('******** config_master.js file is not exist ********');
}

module.exports = config;
