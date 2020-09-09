const { HotModuleReplacementPlugin } = require('webpack');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const socketConfig = require('../config');
const addBaseConfig = require('./webpack-base.config');

const configs = addBaseConfig({
  mode: 'development',
  output: {
    filename: 'js/[name].js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        enforce: 'pre',
        use: ['source-map-loader']
      }
    ]
  },
  plugins: [
    new HotModuleReplacementPlugin(),
    new HtmlWebpackPlugin({
      title: 'HootNet',
      filename: 'index.html',
      template: 'src/html/index.html',
      chunks: ['app']
    }),
    new HtmlWebpackPlugin({
      title: 'Loop Test',
      filename: 'loopTest.html',
      template: 'src/html/loopTest.html',
      chunks: ['looper']
    })
  ],
  devServer: {
    compress: true,
    disableHostCheck: true,
    // sockHost: '5000-e86f92db-f24e-4089-b8df-7bed4a3a25dd.ws-us02.gitpod.io',
    hot: true,
    liveReload: false,
    port: `${socketConfig.DEVPORT}`,
    allowedHosts: ['.github.io'],
    // public: `${socketConfig.GITPODURL}`,
    host: 'localhost',
    proxy: {
      '/bridge/': `http://localhost:${socketConfig.PORT}`
      // '/bridge/': {
      //     target: `http://localhost:${socketConfig.PORT}`,

      // },
    },
    watchOptions: {
      aggregateTimeout: 300,
      poll: 1000
    }
  }
});

const doAsync = async () => {
  const hostName = process.env.HOSTNAME;
  const matcher = hostName.match(/^sse-sandbox-(.*)$/);
  if (matcher) {
    configs.devServer.public = `https://${matcher[1]}-${socketConfig.PORT}.sse.codesandbox.io/`;
    console.log('CONFIG ', configs.devServer.public);
    // configs.devServer.public = 'https://fs76d-5002.sse.codesandbox.io/';
  } else {
    const URL = await socketConfig.GETURL();
    configs.devServer.public = URL;
    console.log(`UPDATE '${configs.devServer.public}' to '${URL}'`);
  }

  return configs;
};
module.exports = doAsync;
