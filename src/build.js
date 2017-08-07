'use strict';

const path = require('path');
const webpack = require('webpack');
const del = require('del');
const webpackConfig = require('../webpack.config');
const fs = require('fs');
const uuid = require('uuid');
const mongodb = require('mongodb');
const config = require('./server/config');

const apiPathFile = path.join(__dirname, './server/apiPath.js');
const buildPath = path.join(__dirname, '../build');
const feApiPath = path.join(buildPath, 'api');

let permissionNames = [];
let permissionPaths = [];

del.sync(path.resolve('build'));
del.sync(apiPathFile);
del.sync(buildPath);

// 读取api接口路径,写入文件
const writeToApiPath = function writeToApiPath() {
  const apiRootPath = path.join(__dirname, './server/api');
  const files = fs.readdirSync(apiRootPath);
  fs.appendFileSync(apiPathFile, "'use strict';\n\nmodule.exports = function api(app) {\n");
  files.forEach((filename) => {
    const fullname = path.join(apiRootPath, filename);
    const stats = fs.statSync(fullname);
    if (stats.isDirectory()) {
      fs.appendFileSync(apiPathFile, `  app.use('/${filename}', require('./api/${filename}'));\n`);
    }
  });
  fs.appendFileSync(apiPathFile, '};\n');
};

const getArrByPattern = function getArrByPattern(codeStr, pattern) {
  const arr = codeStr.match(pattern);
  const newArr = [];
  if (arr) {
    for (let i = 0; i < arr.length; i++) {
      const funcName = arr[i].split(' ')[1];
      newArr.push(funcName);
    }
  }
  return newArr;
};

const writeApiFuncFile = function writeApiFuncFile(filePath, funcName, funcType, funcUrl) {
  const tpl = `api.${funcName} = function ${funcName}(data, scope) {
  return new Promise((resolve, reject) => {
    if (scope) { scope.$progress.start(); }
    axios.${funcType}('${funcUrl}', data).then((response) => {
      if (!response) {
        reject('返回数据格式不正确');
        return false;
      }
      const res = response.data;
      if (res.status === '0') {
        if (scope) { scope.$progress.finish(); }
        return resolve(res);
      }
      if (scope) { scope.$progress.fail(); }
      return reject(res.statusInfo.message);
    }).catch((error) => {
      if (scope) { scope.$progress.fail(); }
      reject(error);
    });
  });
};

`;
  fs.appendFileSync(filePath, tpl);
};

const writeUploadApiFuncFile = function writeApiFuncFile(filePath, funcName, funcType, funcUrl) {
  const tpl = `api.${funcName} = function ${funcName}(param, config) {
  return new Promise((resolve, reject) => {
    axios.${funcType}('${funcUrl}', param, config).then((response) => {
      const res = response.data;
      if (res.status === '0') {
        resolve(res);
      }
      reject(res.statusInfo.message);
    }).catch((error) => {
      reject(error);
    });
  });
};

`;
  fs.appendFileSync(filePath, tpl);
};

const writeGetIconApiFuncFile = function writeApiFuncFile(filePath, funcName, funcType, funcUrl) {
  const tpl = `api.${funcName} = function ${funcName}(id) {
  return '/media/getIcon?objectid=' + id;
};

`;
  fs.appendFileSync(filePath, tpl);
};

// 读取后端接口生成前端调用的函数文件
const generateFeApiFuncFile = function generateFeApiFuncFile() {
  const apiRootPath = path.join(__dirname, './server/api');
  const files = fs.readdirSync(apiRootPath);
  fs.mkdirSync(buildPath);
  fs.mkdirSync(feApiPath);

  files.forEach((filename) => {
    const fullname = path.join(apiRootPath, filename);
    const stats = fs.statSync(fullname);
    if (stats.isDirectory()) {
      const indexFile = path.join(fullname, 'index.js');
      const codeStr = fs.readFileSync(indexFile, 'utf8');
      const funcNameArr = getArrByPattern(codeStr, /@apiName: (.*)/g);
      const funcTypeArr = getArrByPattern(codeStr, /@apiFuncType: (.*)/g);
      const funcUrlArr = getArrByPattern(codeStr, /@apiFuncUrl: (.*)/g);

      const tempPermissionNames = getArrByPattern(codeStr, /@permissionName: (.*)/g);
      const tempPermissionPaths = getArrByPattern(codeStr, /@permissionPath: (.*)/g);

      permissionNames = permissionNames.concat(tempPermissionNames);
      permissionPaths = permissionPaths.concat(tempPermissionPaths);

      if (funcNameArr.length !== funcTypeArr.length || funcNameArr.length !== funcUrlArr.length) {
        throw new Error('funcNameArr cannot match funcTypeArr length or funcUrlArr length');
      }

      if (funcNameArr.length > 0) {
        const filePath = path.join(feApiPath, `${filename}.js`);
        const tpl = `const api = {};
const axios = require('../config');

`;
        fs.appendFileSync(filePath, tpl);
        for (let i = 0; i < funcNameArr.length; i++) {
          if (funcUrlArr[i] === '/upload') {
            writeUploadApiFuncFile(filePath, funcNameArr[i], funcTypeArr[i], funcUrlArr[i]);
          } else if (funcUrlArr[i] === '/media/getIcon') {
            writeGetIconApiFuncFile(filePath, funcNameArr[i], funcTypeArr[i], funcUrlArr[i]);
          } else {
            writeApiFuncFile(filePath, funcNameArr[i], funcTypeArr[i], funcUrlArr[i]);
          }
        }
        fs.appendFileSync(filePath, 'module.exports = api;\n');
      }
    }
  });
};

const initPermissionInfo = function initPermissionInfo() {
  permissionNames.push('所有权限');
  permissionPaths.push('all');
  const nLength = permissionNames.length;
  const pLength = permissionPaths.length;
  if (nLength && nLength === pLength) {
    /* eslint-disable consistent-return */
    mongodb.MongoClient.connect(config.mongodb.umpURL, (err, db) => {
      if (err) {
        console.log(err);
        return false;
      }
      console.log('mongodb connect utils!');
      const permissionInfo = db.collection('PermissionInfo');
      // permissionInfo.find().toArray((err, docs) => {
      //   if (err) {
      //     console.log(err);
      //     return false;
      //   }
      //
      //   if (docs && docs.length) {
      //     for (let i = 0, len = docs.length; i < len; i++) {
      //       const index = permissionPaths.indexOf(docs[i].path);
      //       if (index !== -1) {
      //         permissionPaths.splice(index, 1);
      //         permissionNames.splice(index, 1);
      //       }
      //     }
      //   }

      permissionInfo.removeMany({}, (err) => {
        if (err) {
          throw new Error(`权限表初始化有问题:${err.message}`);
        }
        const info = [];
        for (let i = 0; i < permissionPaths.length; i++) {
          info.push({
            _id: uuid.v1(),
            name: permissionNames[i],
            path: permissionPaths[i],
            createdTime: new Date(),
            modifyTime: new Date(),
            status: '0',
          });
        }
        if (info.length) {
          permissionInfo.insert(info, {
            w: 1,
          }, (err) => {
            if (err) {
              throw new Error(`权限表初始化有问题:${err.message}`);
            }
            return true;
          });
        }
      });
    });
    /* eslint-enable consistent-return */
  } else if (nLength !== pLength) {
    throw new Error('api接口权限注释有问题');
  }
};

generateFeApiFuncFile();

writeToApiPath();

initPermissionInfo();

webpack(webpackConfig, (err, stats) => {
  if (err) {
    // Handle errors here
    throw new Error(JSON.stringify(err.errors));
  } else if (stats.hasErrors()) {
    throw new Error(stats.compilation.errors);
  }
  console.log('server webpack completely...');
  const done = function done() {
    process.exit(0);
  };
  require('./runGulp')(done);
});
