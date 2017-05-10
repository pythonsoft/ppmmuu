// 引入 gulp
var gulp = require('gulp');
// 引入组件
var concat = require('gulp-concat');
var uglify = require('gulp-uglify');
var rename = require('gulp-rename');
var replace = require('gulp-replace');
var cleanCSS = require('gulp-clean-css');
var rev = require('gulp-rev');
var path = require('path');
var fs = require('fs');

var del = require('del');

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

const readRevJSON = function(assetsPath) {
  let assets = {};
  if(!fs.existsSync(assetsPath)) { return assets; }
  const assetsContent = fs.readFileSync(assetsPath, { encoding: 'utf8' });
  assets = (new Function('return ' + assetsContent))();
  return assets;
};

const jsAssetsPath = path.join(buildPath, 'assets.json');
const cssAssetsPath = path.join(buildPath, 'rev-manifest.json');

const jsRevJSON = readRevJSON(jsAssetsPath);
const cssRevJSON = readRevJSON(cssAssetsPath);

const revJSON = Object.assign({}, jsRevJSON, cssRevJSON);

// gulp.task('rev', ['baseCss'], function() {
gulp.task('rev', function() {
  return gulp.src(['./src/fe/html/*.pug'])
    .pipe(replace(/{\$(.*)}/g, function(match, keyword) {
      return revJSON[keyword];
    }))
    .pipe(gulp.dest(path.join(buildPath,'views')));
});

gulp.task('config', function() {
  return gulp.src(['./src/server/config_master.js'])
    .pipe(gulp.dest(buildPath));
});

gulp.task('default', [
  'rev', 'config'
]);

if(process.env.NODE_ENV === 'development') {
  console.log('watch start...');
  del.sync(buildPublicPath);
  del.sync(buildViewsPath);

  var watcher = gulp.watch([
    // './src/fe/css/**/*.css',
    './src/fe/html/**/*.pug',
  ], ['rev']);
  watcher.on('change', function(event) {
    console.log('File ' + event.path + ' was ' + event.type + ', running tasks...');
  });
}

