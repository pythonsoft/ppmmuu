var webpack = require('webpack');
var fs = require('fs');

var ExtractTextPlugin = require('extract-text-webpack-plugin');
var AssetsPlugin = require('assets-webpack-plugin');
var DEBUG = process.env.NODE_ENV === 'development';

var path = require('path');
var glob = require('glob');
function getEntries() {
  var entry = {};
  var fileList = glob.sync("./src/fe/routers/app.js").forEach(function(file) {
    var name = path.basename(file);
    entry[name.split('.')[0]] = DEBUG ? ['webpack-hot-middleware/client', file] : file;
  })
  return entry;
}

let config = {};

config.server = {
  entry: './src/server/app.js',
  output: {
    path: path.join(__dirname, 'build'),
    filename: 'server.js',
    chunkFilename: 'server.[name].js',
    libraryTarget: 'commonjs2'
  },
  target: 'node',
  externals: [
    /^\.\/assets$/,
    /^[@a-z][a-z\/\.\-0-9]*$/i,
  ],
  node: {
    console: false,
    global: false,
    process: false,
    Buffer: false,
    __filename: false,
    __dirname: false,
  },
  devtool: 'source-map',
  module: {
  }
};
config.fe = {
  entry: getEntries(),
  output: {
    publicPath: '',
    path: path.join(__dirname, './build/public'),
    filename: DEBUG ? '[name].js' : '[name].[hash].js',
    chunkFilename: '[name].[id].js'
  },
  module: {
    rules: [
      {
        test: /\.vue$/,
        loader: 'vue-loader'
      },
      {
        test: /\.js$/,
        loader: 'babel-loader',
        exclude: /node_modules/,
        query: {
          presets: ['es2015'],
          plugins: ['transform-runtime']
        }
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: [
            {
              loader: 'css-loader'
            },
            {
              loader: 'postcss-loader',
              options: {
                plugins: function() {
                  return [
                    require('postcss-import'),
                    require('autoprefixer')
                  ]
                }
              }
            }
          ]
        })
      },
      {
        test: /\.(eot|svg|ttf|woff|woff2)(\?\S*)?$/,
        loader: 'file-loader'
      },
      {
        test: /\.(png|jpe?g|gif|svg)(\?\S*)?$/,
        loader: 'file-loader',
        query: {
          name: '[name].[ext]?[hash]'
        }
      }
    ]
  },
  resolve: {
    alias: {
      'vue$': 'vue/dist/vue.common.js'
    }
  },
  devtool: 'cheap-module-eval-source-map',
  plugins: [
    new ExtractTextPlugin({
      filename: "main.css",
      allChunks: true
    }),
    new webpack.HotModuleReplacementPlugin(),
    new webpack.NoEmitOnErrorsPlugin(),
    new webpack.optimize.CommonsChunkPlugin({
      name: 'vendor',
      minChunks: function (module) {
        return module.context && module.context.indexOf('node_modules') !== -1;
      }
    }),
    new AssetsPlugin({
      path: path.join(__dirname, './build'),
      filename: 'assets.json',
      processOutput: function(x) {
        let doc = {};
        for(let k in x) {
          doc[k] = (function(key) {
            let rs = null;
            for(let _k in key) {
              if(_k == 'js') {
                rs = key[_k];
              }else if(_k == 'css') {
                doc['css'] = key[_k];
              }
              // break;
            }
            return rs
          })(x[k]);
        }
        // return `module.exports = ${JSON.stringify(x, null, 2)};`
        return `${JSON.stringify(doc, null, 2)}`
      },
    })
  ]
}

module.exports = config;

// 相当于 webpack -p (webpack --optimize-minimize --define process.env.NODE_ENV="'production'")
if(!DEBUG) {
  module.exports.fe.plugins = (module.exports.fe.plugins || []).concat([
    new webpack.DefinePlugin({
      'process.env': {
        NODE_ENV: '"production"'
      }
    }),
    new webpack.LoaderOptionsPlugin({
      minimize: true
    }),
    new webpack.optimize.UglifyJsPlugin({
      compress: {
        screw_ie8: true,
        warnings: false
      }
    })
  ])
}
