const path = require('path');
const del = require('del');
const webpack = require('webpack');
const webpackConfig = require('../webpack.config');

del.sync(path.resolve('build'));

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
