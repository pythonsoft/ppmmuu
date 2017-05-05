const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const del = require('del');

const fs = require('fs');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', express.static(path.resolve('build', 'public')));
app.set('views', path.resolve('build', 'views'));
app.set('view engine', 'pug');

const runServer = function() {
  app.listen('8000', function() {
    var routersPath = path.join(__dirname, './fe/routers');
    // var feRoutes = {};
    // fs.readdirSync(routersPath).forEach(file => {
    //   if (fs.statSync(path.join(routersPath, file)).isDirectory()) {
    //     feRoutes[]
    //   }
    // })

    app.use('*', function(req, res, next) {
      const url = req.originalUrl;
      if(!path.extname(url) && !(/^\/api/.test(url))) {
        if(!fs.statSync(path.join(routersPath, url)).isDirectory()) {
          res.render('404');
          return false;
        }

        res.render("index");
      }else {
        next();
      }
    })

    app.get('/api/test', (req, res) => {
      res.end('api test');
    });

    console.log('Listening on port ' + '8000' + '...');
  });
};

if(process.env.NODE_ENV === 'development') {

  del.sync(path.resolve('build'));

  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../webpack.config');

  webpack(webpackConfig.fe, function(err, stats) {
    if (err || stats.hasErrors()) {
      throw new Error(JSON.stringify(err));
    }

    runServer();
    require('./runGulp')();
  });

  let compiler = webpack(webpackConfig.fe);
  app.use(webpackDevMiddleware(compiler, {
    noInfo: false,
    stats: {
      colors: true,
      chunks: false
    },
    publicPath: webpackConfig.fe.output.publicPath
  }));
  app.use(webpackHotMiddleware(compiler));
}else {
  runServer();
}





