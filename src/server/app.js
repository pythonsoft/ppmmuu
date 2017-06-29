const fs = require('fs');
const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const del = require('del');
const mongoClient = require('mongodb').MongoClient;
const config = require("./config");
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const i18nMiddleware = require('./middleware/i18n');
const feMiddleware = require('./middleware/fe');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', express.static(path.resolve('build', 'public')));
app.set('views', path.resolve('build', 'views'));
app.set('view engine', 'pug');

app.use(i18nMiddleware);
app.use(feMiddleware);

const initMongodb = function(names, completeFn) {
  let init = function(index) {
    let name = names[index];
    if(!name) {
      completeFn && completeFn(); return false;
    }

    mongoClient.connect(config.mongodb[name + 'URL'], {
      autoReconnect: true,
      poolSize: 10
    }, function(err, db) {
      if(err) {
        throw new Error(err);
        db.close();
        return;
      }
      config.dbInstance[name + 'DB'] = db;
      init(index + 1);
      console.log('connect mongodb: '+ name + ' success!');
    });
  };

  init(0);
};

const runServer = function() {
  initMongodb(['ump'], function() {
    app.listen(config.port, function () {

      require('./apiPath.js')(app);
      require('./mongodbScript/init');

      console.log('Listening on port ' + config.port + '...');
    });
  });
};

if(process.env.NODE_ENV === 'development') {

  del.sync(path.resolve('build'));

  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../../webpack.config.js');

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

  runServer();

  // initialize swagger-jsdoc
  let swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'API',
        version: 1,
        description: 'Testing how to describe a RESTful API with Swagger',
      },
      host: config.host,
      basePath: '/api',

    },
    //TODO: import apis as below
    apis: [
      './**/api/*/index.js',
      './**/api/*/*Info.js',
    ],
  };
  let swaggerSpec = swaggerJSDoc(swaggerOptions);

// set swagger-ui-express
  let showExplorer = true;
  let swaggerUiOptions = {};
  let swaggerUiCss = '';


// import rests
  app.get('/api-docs.json', function(req, res) {
    res.set({
      'Content-Type': 'application/json',
    });
    res.send(swaggerSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, showExplorer, swaggerUiOptions, swaggerUiCss));
  require('./../runGulp')();
}else {
  runServer();
}





