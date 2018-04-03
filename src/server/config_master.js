/**
 * Created by steven on 17/5/5.
 */

'use strict';

/* eslint-disable no-undef */
config.host = 'localhost:8080';
config.domain = `http://${config.host}`;

config.dbName = process.env.NODE_ENV === 'test' ? 'ump_test' : 'ump';

config.mongodb = {
  // [`${config.dbName}URL`]: `mongodb://localhost:27017/${config.dbName === 'ump' ? 'ump_v1' : 'ump_test'}`,
  [`${config.dbName}URL`]: `mongodb://10.0.15.62:27017/${config.dbName === 'ump' ? 'ump_v1' : 'ump_test'}`,
};

config.redis_host = '10.0.15.69';
// config.redis_host = 'localhost';
config.redis_port = 6379;
config.redis_opts = { auth_pass: 'phoenixtv2017' };
// config.redis_opts = { auth_pass: '' };
config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7; // cookie有效期七天
config.redisExpires = 1 * 60 * 60 * 12; // redis有效期12小时
config.redisMediaThumbExpires = 60 * 60 * 12 * 30; // 缓存媒体库缩略图有效期30天
config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;

config.engineCenter = {
  host: '10.0.15.100',
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
config.solrBaseUrl = 'http://solr.szdev.cn/solr/';
// es搜索地址
config.esBaseUrl = 'http://10.0.15.204:9200/';
// 香港检索基础api地址
config.hongkongUrl = 'http://w2.phoenixtv.com/mamapi/';

// ump fe api地址
config.umpFeAPI = process.env.NODE_ENV === 'development' ? 'http://localhost:8080' : 'http://api.szdev.cn';

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
  'http://localhost:8000',
  'http://localhost:8080',
  'http://10.0.15.68:8000',
  'http://10.0.16.115:8000',
  'http://10.0.16.115:8080',
  'http://10.0.16.105:8000',
  'http://10.0.15.105:8080',
  'http://10.0.15.101:8080',
  'http://10.0.16.125:8000',
  'http://ump.szdev.cn',
  'http://api.szdev.cn',
  'http://localhost.szdev.cn:8000',
  'http://localhost.szdev.cn:8080',
  'http://10.0.15.80:8080',
];

config.normalMenuPermission = ['taskCenter', 'personalCenter'];
config.adminMenuPermission = config.normalMenuPermission.concat(['management']);

// 快传api地址
config.mediaExpressUrl = 'https://leo.cloudifeng.com/';

// 升级包存在地址
config.upgradePackage = config.uploadPath;

config.upgradeSystem = {
  // ump: '/Users/chaoningx/Desktop/temp/ump',
  // fe: '/Users/chaoningx/Desktop/temp/fe',
  ump: '/Users/steven/Desktop/temp/ump',
  fe: '/Users/steven/Desktop/temp/ump-fe',
};

// 订阅自动推送配置
config.phoenixAdminUserName = 'xuyawen';   // 快传发送方
config.subscribeDownloadTemplateId = 'subscribe_autopush';   // 下载模板Id

config.socketURL = 'http://localhost:9000';

// 视频服务器地址
config.streamURL = 'http://10.0.15.68:8099';
config.hkRuku = '/h';


// 大洋新闻系统对应id
config.DAYANG_ID = '63244331-906c-4aa4-b391-ee249496de62';

// 环信配置
config.client_id = 'YXA69Z_m4Pm6EeecZrWgZ2F4vA';
config.client_secret = 'YXA6LvdT0V-OerbAW7inECGv4l5dzns';
config.easemob_url = 'https://a1.easemob.com/1119180112178786/assistant/';

// 记者云扫码默认页
config.journalistCloud = 'http://10.0.16.132:8000/apps/journalistCloud';

// 订阅视频下载服务地址
config.subscribeDownloadUrl = 'http://localhost:3000/';

