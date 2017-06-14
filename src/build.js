const path = require('path');
const del = require('del');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const fs = require('fs');

const apiPathFile = path.join(__dirname, './server/apiPath.js');
const feApiPath = path.join(__dirname, './fe/lib/api');
del.sync(path.resolve('build'));
del.sync(apiPathFile);
del.sync(feApiPath);

//读取api接口路径,写入文件
var writeToApiPath = function(){
  var apiRootPath = path.join(__dirname, './server/api');
  var files = fs.readdirSync(apiRootPath);
  fs.appendFileSync(apiPathFile, "module.exports = function(app){\n");
  files.forEach(function (filename) {
    var fullname = path.join(apiRootPath, filename);
    var stats = fs.statSync(fullname);
    if (stats.isDirectory()){
      fs.appendFileSync(apiPathFile, "  app.use('/api/" + filename + "', require('./api/" + filename + "'));\n");
    }
  });
  fs.appendFileSync(apiPathFile, "}");
}

var getArrByPattern = function(codeStr, pattern){
  var arr = codeStr.match(pattern);
  var newArr = [];
  if(arr) {
    for( let i = 0 ; i < arr.length; i++){
      var funcName = arr[i].split(' ')[1];
      newArr.push(funcName);
    }
  }
  return newArr;
}

var writeApiFuncFile = function(filePath, funcName, funcType, funcUrl){
  fs.appendFileSync(filePath, "  " + funcName + "(data,cb) {\n    $.ajax({\n      url: '" + funcUrl + "',\n      type: '" + funcType + "',\n      data: data,\n      cache: false\n    }).done(data => {\n      cb(data)\n    })\n  },\n\n");
}

//读取后端接口生成前端调用的函数文件
var generateFeApiFuncFile = function(){
  var apiRootPath = path.join(__dirname, './server/api');
  var files = fs.readdirSync(apiRootPath);
  fs.mkdirSync(feApiPath);
  files.forEach(function (filename) {
    var fullname = path.join(apiRootPath, filename);
    var stats = fs.statSync(fullname);
    if (stats.isDirectory()){
      var indexFile = path.join(fullname, 'index.js');
      var codeStr = fs.readFileSync(indexFile, 'utf8');
      var funcNameArr = getArrByPattern(codeStr, /@apiName: (.*)/g);
      var funcTypeArr = getArrByPattern(codeStr, /@apiFuncType: (.*)/g);
      var funcUrlArr = getArrByPattern(codeStr, /@apiFuncUrl: (.*)/g);

      if(funcNameArr.length != funcTypeArr.length || funcNameArr.length != funcUrlArr.length){
        throw new Error("funcNameArr cannot match funcTypeArr length or funcUrlArr length");
      }

      if(funcNameArr.length > 0) {
        var filePath = path.join(__dirname, './fe/lib/api', filename + '.js');
        fs.appendFileSync(filePath, "export default {\n");
        for (let i = 0; i < funcNameArr.length; i++) {
          writeApiFuncFile(filePath, funcNameArr[i], funcTypeArr[i], funcUrlArr[i]);
        }
        fs.appendFileSync(filePath, "}");
      }
    }
  });
}

generateFeApiFuncFile();

writeToApiPath();

webpack(webpackConfig.fe, function(err, stats) {
  if (err) {
    // Handle errors here
    throw new Error(JSON.stringify(err.errors));
  }else if(stats.hasErrors()){
    throw new Error(stats.compilation.errors);
  }

  require('./runGulp')(function done() {
    console.log('server webpack completely...');
  });
});

webpack(webpackConfig.server, function(err, stats) {
  if (err) {
    // Handle errors here
    throw new Error(JSON.stringify(err.errors));
  }else if(stats.hasErrors()){
    throw new Error(stats.compilation.errors);
  }

  console.log('server webpack completely...');
});