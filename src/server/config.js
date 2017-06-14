/**
 * Created by steven on 17/5/5.
 */
const path = require('path');
const fs = require('fs');
const vm = require('vm');
const mongodb = require('mongodb');

let config = {};
const configPath = path.join(__dirname, './config_master.js');

config.mongodb = {
  url: 'mongodb://10.0.15.62:27017/ump_v1',
  dbInstance: null
};

config.KEY = 'secret';
config.cookieExpires = 1000 * 60 * 60 * 24 * 7;

config.port = process.env.NODE_ENV === 'development' ? 8080 : 8080;

if(!config.mongodb.dbInstance){
  mongodb.MongoClient.connect(config.mongodb.url, function(err, db) {
    if (err) {
      console.log(err);
      return false;
    }
    config.mongodb.dbInstance = db;
  })
}

let readConfig = function(p) {
  const sandbox = {
    path: path,
    config: config,
    __dirname: __dirname,
    console: console,
    process: process
  };
  vm.createContext(sandbox);
  vm.runInContext(fs.readFileSync(p), sandbox);
};

if(fs.existsSync(configPath)) {
  //读取生产环境config_master.js文件
  readConfig(configPath);

}else {
  if (process.env.NODE_ENV == 'development') { //本地开发环境
    readConfig(path.join(__dirname, './config_master.js'));
    config.host = "localhost:8000";
    config.domain = 'http://' + config.host;

  }else {
    throw new Error('******** config_master.js file is not exist ********');
  }
};

module.exports = config;