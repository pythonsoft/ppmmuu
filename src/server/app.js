
'use strict';

const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const mongoClient = require('mongodb').MongoClient;
const config = require('./config');
const i18nMiddleware = require('./middleware/i18n');
const cors = require('cors');

const app = express();

const corsOptions = {
  origin(origin, callback) {
    if (config.whitelist.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
};

//app.use(cors(corsOptions));

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', express.static(path.resolve('build', 'public')));
app.set('views', path.resolve('build', 'views'));
app.set('view engine', 'pug');

app.use(i18nMiddleware);

const initMongodb = function initMongodb(names, completeFn) {
  /* eslint-disable consistent-return */
  const init = function init(index) {
    const name = names[index];
    if (!name) {
      return completeFn && completeFn();
    }
    mongoClient.connect(config.mongodb[`${name}URL`], {
      autoReconnect: true,
      poolSize: 10,
    }, (err, db) => {
      if (err) {
        throw new Error(err);
      }
      config.dbInstance[`${name}DB`] = db;
      init(index + 1);
      console.log(`connect mongodb: ${name} success!`);
      return false;
    });
  };
  /* eslint-enable consistent-return */

  init(0);
};

const runServer = function runServer() {
  initMongodb(['ump'], () => {
    app.listen(config.port, () => {
      require('./apiPath.js')(app); // eslint-disable-line
      require('./mongodbScript/index');

      console.log(`Listening on port ${config.port}...`);
    });
  });
};

if (process.env.NODE_ENV === 'development') {
  runServer();

  // initialize swagger-jsdoc
  const swaggerOptions = {
    swaggerDefinition: {
      info: {
        title: 'API',
        version: '1.0.0',
        description: 'Testing how to describe a RESTful API with Swagger',
      },
      host: config.host,
      basePath: '/',

    },
    // TODO: import apis as below
    apis: [
      './**/api/*/*.js',
      './**/common/*.js',
    ],
  };
  const swaggerJSDoc = require('swagger-jsdoc');
  const swaggerUi = require('swagger-ui-express');
  const swaggerSpec = swaggerJSDoc(swaggerOptions);

  // set swagger-ui-express
  const showExplorer = true;
  const swaggerUiOptions = {};
  const swaggerUiCss = '';


  // import rests
  app.get('/api-docs.json', (req, res) => {
    res.set({
      'Content-Type': 'application/json',
    });
    res.send(swaggerSpec);
  });
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, showExplorer, swaggerUiOptions, swaggerUiCss));
  require('./../runGulp')();
} else {
  runServer();
}

