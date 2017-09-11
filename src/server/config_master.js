/**
 * Created by steven on 17/5/5.
 */

'use strict';

/* eslint-disable no-undef */
config.host = 'localhost:8080';
config.domain = `http://${config.host}`;
config.mongodb = {
  umpURL: 'mongodb://10.0.15.62:27017/ump_v1',
};

config.redis_host = '10.0.15.69';
config.redis_port = 6379;
config.redis_opts = { auth_pass: 'phoenixtv2017' };
config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7; // cookie有效期七天
config.redisExpires = 1 * 60 * 60 * 12; // redis有效期12小时
config.redisMediaThumbExpires = 60 * 60 * 12 * 30; // 缓存媒体库缩略图有效期30天
config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;

// solr搜索地址
config.solrBaseUrl = 'http://solr.szdev.cn/solr/';
// 香港检索基础api地址
config.hongkongUrl = 'http://w2.phoenixtv.com/mamapi/';
// ump fe api地址
config.umpFeAPI = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'http://api.szdev.cn';

// if(process.env.NODE_ENV === 'online') {
//   config.umpFeAPI = 'http://hk.api.szdev.cn'
// }

config.HKAPI = {
  hostname: 'w2.phoenixtv.com',
  port: 80,
};

// 日志路径
config.logPath = path.join(__dirname, '../logs/');

// path for uploading files
config.uploadPath = path.join(__dirname, '../../uploads/');

// 允许跨域访问的地址列表
config.whitelist = ['http://localhost:8000', 'http://localhost:8080', 'http://10.0.15.68:8000', 'http://10.0.15.105:8000', 'http://10.0.15.105:8080'];

config.normalMenuPermission = ['mediaCenter', 'taskCenter', 'personalCenter'];
config.adminMenuPermission = config.normalMenuPermission.concat(['management']);
