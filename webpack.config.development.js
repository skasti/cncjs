const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const ESLintPlugin = require('eslint-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const without = require('lodash/without');
const MiniCssExtractPlugin = require('mini-css-extract-plugin');
const webpack = require('webpack');
const babelConfig = require('./babel.config');
const buildConfig = require('./build.config');
const pkg = require('./src/package.json');

dotenv.config({
  path: path.resolve('webpack.config.development.env'),
});

const isWebpackDevServer = process.env.WEBPACK_DEV_SERVER;
const publicPath = process.env.PUBLIC_PATH || '';
const buildVersion = pkg.version;
const timestamp = new Date().getTime();

module.exports = {
  mode: 'development',
  cache: {
    type: 'filesystem',
  },
  target: 'web',
  context: path.resolve(__dirname, 'src/app'),
  devtool: 'eval-cheap-module-source-map',
  entry: {
    polyfill: [
      path.resolve(__dirname, 'src/app/polyfill/index.js'),
      'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true',
    ],
    app: [
      path.resolve(__dirname, 'src/app/index.jsx'),
      'webpack-hot-middleware/client?path=/__webpack_hmr&reload=true',
    ],
  },
  output: {
    path: path.resolve(__dirname, 'output/cncjs/app'),
    chunkFilename: `[name].[chunkhash].chunk.js?_=${timestamp}`,
    filename: `[name].[contenthash].bundle.js?_=${timestamp}`,
    pathinfo: true,
    publicPath: publicPath,
  },
  module: {
    rules: [
      {
        test: /\.jsx?$/,
        loader: 'babel-loader',
        options: {
          ...babelConfig(),
          env: {
            development: {
              plugins: ['react-hot-loader/babel']
            }
          }
        },
        exclude: /node_modules/
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[path][name]__[local]--[hash:base64:5]',
                exportLocalsConvention: 'camelCase',
              },
              importLoaders: 1,
              // 0 => no loaders (default)
              // 1 => stylus-loader
            }
          },
          'stylus-loader'
        ],
        exclude: [
          path.resolve(__dirname, 'src/app/styles')
        ]
      },
      {
        test: /\.styl$/,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'global',
                exportLocalsConvention: 'camelCase',
              },
              importLoaders: 1,
              // 0 => no loaders (default)
              // 1 => stylus-loader
            }
          },
          'stylus-loader',
        ],
        include: [
          path.resolve(__dirname, 'src/app/styles'),
        ],
      },
      {
        test: /\.css$/,
        use: [
          'style-loader',
          'css-loader',
        ],
      },
      {
        test: /\.(png|jpg|svg)$/,
        loader: 'url-loader',
        options: {
          limit: 8192,
        },
      },
      {
        test: /\.woff(2)?(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'url-loader',
        options: {
          limit: 10000,
          mimetype: 'application/font-woff',
        },
      },
      {
        test: /\.(ttf|eot)(\?v=[0-9]\.[0-9]\.[0-9])?$/,
        loader: 'file-loader',
      },
    ].filter(Boolean),
  },
  plugins: [
    new webpack.EnvironmentPlugin({
      NODE_ENV: JSON.stringify('development'),
      BUILD_VERSION: JSON.stringify(buildVersion),
      LANGUAGES: JSON.stringify(buildConfig.languages),
      TRACKING_ID: JSON.stringify(buildConfig.analytics.trackingId),
    }),
    new webpack.LoaderOptionsPlugin({
      debug: true,
    }),
    new webpack.ContextReplacementPlugin(
      /moment[\/\\]locale$/,
      new RegExp('^\./(' + without(buildConfig.languages, 'en').join('|') + ')$'),
    ),
    new ESLintPlugin(),
    new MiniCssExtractPlugin({
      filename: `[name].css?_=${timestamp}`,
      chunkFilename: `[id].css?_=${timestamp}`,
    }),
    // HtmlWebpackPlugin
    (() => {
      const filename = 'index.html';
      const template = path.resolve(__dirname, 'src/app/index.tmpl.html');

      if (isWebpackDevServer) {
        return new HtmlWebpackPlugin({
          filename,
          templateContent: (() => {
            return fs.readFileSync(template, 'utf8')
              .replace(/{{dir}}/g, 'ltr')
              .replace(/{{title}}/g, `CNCjs ${buildVersion}`)
              .replace(/{{webroot}}/g, '/')
              .replace(/{{loading}}/g, 'Loading...');
          })(),
        });
      }

      return (
        new HtmlWebpackPlugin({
          filename,
          template,
        })
      );
    })(),
  ].filter(Boolean),
  resolve: {
    alias: {
      'react-spring$': 'react-spring/web.cjs',
      'react-spring/renderprops$': 'react-spring/renderprops.cjs',
    },
    extensions: ['.js', '.jsx'],
    fallback: {
      fs: false,
      net: false,
      path: require.resolve('path-browserify'),
      stream: require.resolve('stream-browserify'),
      timers: require.resolve('timers-browserify'),
      tls: false,
    },
    modules: [
      path.resolve(__dirname, 'src'),
      'node_modules',
    ],
  },
  devServer: {
    allowedHosts: 'all',
    compress: true,
    devMiddleware: {
      writeToDisk: true,
    },
    host: process.env.WEBPACK_DEV_SERVER_HOST,
    hot: true,
    proxy: {
      '/api': {
        target: process.env.PROXY_TARGET,
        changeOrigin: true,
      },
      '/socket.io': {
        target: process.env.PROXY_TARGET,
        changeOrigin: true,
      },
    },
    static: {
      directory: path.resolve(__dirname, 'output/cncjs/app'),
      watch: true,
    },
  },
};
