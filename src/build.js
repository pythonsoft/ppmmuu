const path = require('path');
const del = require('del');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');
const fs = require('fs');

const apiPathFile = path.join(__dirname, './server/apiPath.js');
del.sync(path.resolve('build'));
del.sync(apiPathFile);

//读取api接口路径,写入文件
var writeToApiPath = function(){
  var apiRootPath = path.join(__dirname, './server/api');
  var files = fs.readdirSync(apiRootPath);
  fs.appendFileSync(apiPathFile, "module.exports = function(app){\n");
  files.forEach(function (filename) {
    var fullname = path.join(apiRootPath, filename);
    var stats = fs.statSync(fullname);
    if (stats.isDirectory()){
      fs.appendFileSync(apiPathFile, "  app.use('/api/" + filename + "', require('./server/api/" + filename + "'));\n");
    }
  });
  fs.appendFileSync(apiPathFile, "}");
}

writeToApiPath();

webpack(webpackConfig.fe, function(err, stats) {
  if (err || stats.hasErrors()) {
    throw new Error(JSON.stringify(err));
  }

  require('./runGulp')(function done() {
    console.log('server webpack completely...');
  });
});

webpack(webpackConfig.server, function(err, stats) {
  if (err || stats.hasErrors()) {
    // Handle errors here
    throw new Error(JSON.stringify(err));
  }

  console.log('server webpack completely...');
});