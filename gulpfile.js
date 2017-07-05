'use strict';

// 引入 gulp
const gulp = require('gulp');
// 引入组件
const replace = require('gulp-replace');
const path = require('path');
const fs = require('fs');

const del = require('del');

const buildPath = path.join(__dirname, 'build');
const buildPublicPath = path.join(buildPath, 'public');
const buildViewsPath = path.join(buildPath, 'views');

// gulp.task('baseCss', function() {
//   return gulp.src([
//     './src/fe/css/**/*.css'
//   ]).pipe(cleanCSS({ compatibility: 'ie8' }))
//     .pipe(rev())
//     .pipe(gulp.dest(path.join(buildPublicPath, 'css')))
//     .pipe(rev.manifest({
//       merge: true
//     }))
//     .pipe(gulp.dest(buildPublicPath));
// });

const readRevJson = function readRevJson(assetsPath) {
  let assets = {};
  if (!fs.existsSync(assetsPath)) { return assets; }
  const assetsContent = fs.readFileSync(assetsPath, { encoding: 'utf8' });
  assets = (new Function(`return ${assetsContent}`))(); // eslint-disable-line
  return assets;
};

const jsAssetsPath = path.join(buildPath, 'assets.json');
const cssAssetsPath = path.join(buildPath, 'rev-manifest.json');

const jsRevJSON = readRevJson(jsAssetsPath);
const cssRevJSON = readRevJson(cssAssetsPath);

const revJSON = Object.assign({}, jsRevJSON, cssRevJSON);

// gulp.task('rev', ['baseCss'], function() {
gulp.task('rev', () => gulp.src(['./src/fe/html/*.pug'])
  .pipe(replace(/{\$(.*)}/g, (match, keyword) => revJSON[keyword]))
  .pipe(gulp.dest(path.join(buildPath, 'views'))));

gulp.task('config', () => gulp.src(['./src/server/config_master.js'])
  .pipe(gulp.dest(buildPath)));

gulp.task('default', [
  'rev', 'config',
]);

if (process.env.NODE_ENV === 'development') {
  console.log('watch start...');
  del.sync(buildPublicPath);
  del.sync(buildViewsPath);

  const watcher = gulp.watch([
    // './src/fe/css/**/*.css',
    './src/fe/html/**/*.pug',
  ], ['rev']);
  watcher.on('change', (event) => {
    console.log(`File ${event.path} was ${event.type}, running tasks...`);
  });
}

