const path = require('path');
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const del = require('del');
const mongodb = require('mongodb');
const config = require('./config');
let swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
let i18nMiddleware = require('./middleware/i18n');

const fs = require('fs');

const app = express();

app.use(cookieParser());
app.use(bodyParser.json()); // for parsing application/json
app.use(bodyParser.urlencoded({ extended: true })); // for parsing application/x-www-form-urlencoded
app.use('/', express.static(path.resolve('build', 'public')));
app.set('views', path.resolve('build', 'views'));
app.set('view engine', 'pug');
app.use(i18nMiddleware);

const runBackEndServer = function() {
  mongodb.MongoClient.connect(config.mongodb.url, function(err, db) {
    if(err) {
      console.log(err);
      return false;
    }

    config.mongodb.dbInstance = db;
    require('./apiPath.js')(app);
  });
};

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
      var url = req.originalUrl;
      if(!path.extname(url) && !(/^\/api/.test(url))) {
        if(!fs.statSync(path.join(routersPath, url)).isDirectory()) {
          res.render('404');
          return false;
        }

        res.render("index");
      }else{
        next();
      }
    })

    runBackEndServer();

    app.get('/api/test', (req, res) => {
      res.end('api test');
    });

    console.log('Listening on port ' + '8000' + '...');
  });
};

if(process.env.NODE_ENV === 'development') {
  console.log("hhhhhh");

  del.sync(path.resolve('build'));

  const webpack = require('webpack');
  const webpackDevMiddleware = require('webpack-dev-middleware');
  const webpackHotMiddleware = require('webpack-hot-middleware');
  const webpackConfig = require('../../webpack.config.js');

  webpack(webpackConfig.fe, function(err, stats) {
    if (err || stats.hasErrors()) {
      throw new Error(JSON.stringify(err));
    }

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

    console.log(swaggerSpec);

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





