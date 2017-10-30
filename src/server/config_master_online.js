/**
 * Created by steven on 17/5/5.
 */

'use strict';

/* eslint-disable no-undef */
config.host = 'ump-api.phoenixtv.com';
config.domain = `http://${config.host}`;

config.dbName = 'ump';

config.mongodb = {
  umpURL: 'mongodb://172.19.223.147:27017/ump_v1',
};

config.redis_host = '172.19.223.163';
config.redis_port = 6379;
config.redis_opts = { auth_pass: 'phoenixtv2017' };
config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7; // cookie有效期七天
config.redisExpires = 1 * 60 * 60 * 12; // redis有效期12小时
config.redisMediaThumbExpires = 60 * 60 * 12 * 30; // 缓存媒体库缩略图有效期30天
config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;

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

// solr搜索地址
config.solrBaseUrl = 'http://hk.solr.szdev.cn/solr/';
// es搜索地址
config.esBaseUrl = 'http://10.0.15.204:9200/';
// 香港检索基础api地址
config.hongkongUrl = 'http://w2.phoenixtv.com/mamapi/';
// ump fe api地址
config.umpFeAPI = 'http://ump-api.phoenixtv.com';

config.HKAPI = {
  hostname: 'w2.phoenixtv.com',
  port: 80,
};

// 日志路径
config.logPath = path.join(__dirname, '../logs/');

// path for uploading files
config.uploadPath = path.join(__dirname, '../../uploads/');

// 允许跨域访问的地址列表
config.whitelist = [
  'http://ump.phoenixtv.com',
  'http://ump-api.phoenixtv.com',
  'http://ump-live.phoenixtv.com',
];

config.normalMenuPermission = ['mediaCenter', 'taskCenter', 'personalCenter', 'library'];
config.adminMenuPermission = config.normalMenuPermission.concat(['management']);

// 快传api地址
config.mediaExpressUrl = 'https://leo.cloudifeng.com/';

// 升级包存在地址
config.upgradePackage = config.uploadPath;

config.upgradeSystem = {
  // ump: '/Users/chaoningxie/Desktop/temp/install/ump',
  // fe: '/Users/chaoningxie/Desktop/temp/install/fe',
  ump: '',
  fe: ''
};
