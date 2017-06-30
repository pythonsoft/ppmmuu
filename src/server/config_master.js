/**
 * Created by steven on 17/5/5.
 */
config.host = "localhost:8080";
config.domain = 'http://' + config.host;
config.mongodb = {
  umpURL: 'mongodb://10.0.15.62:27017/ump_v1'
};

config.redis_host = "10.0.15.105";
config.redis_port = 6379;
config.redis_opts = {auth_pass: "steven"};
config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7;  //cookie有效期七天
config.redisExpires = 1 * 60 * 60 * 12;       //redis有效期12小时
config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;
