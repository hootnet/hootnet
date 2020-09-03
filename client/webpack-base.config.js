const _ = require('lodash');
const FaviconsWebpackPlugin = require('favicons-webpack-plugin');

const sharedConfigs = {
  plugins: [
      new FaviconsWebpackPlugin()
  ],  
  context: __dirname,
  entry: {
    app: './src/index.js',
    looper: './src/looper.js'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules|bower_components)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: ['@babel/preset-react', '@babel/preset-env'],
            plugins:['@babel/plugin-proposal-class-properties']  
          }   
        }
      },
      {
        test: require.resolve('webrtc-adapter'),
        use: 'expose-loader'
      },              
      {
          test: /\.scss$/,
          use: ["style-loader", "css-loader", "sass-loader"]
      },
      {
          test: /\.css$/,
          use: ["style-loader", "css-loader", "postcss-loader"]
      },
      {
          test: /\.(png|woff|woff2|eot|ttf|svg)$/,
          use: [
              {
                  loader: "file-loader",
                  options: {
                      name: "[name].[ext]",
                      outputPath: "assets"
                  }
              }
          ]
      }
    ]
  }
};

const mergeResolver = (objValue, srcValue) => (
  _.isArray(objValue) ? objValue.concat(srcValue) : undefined
);

module.exports = (configs) => _.mergeWith(sharedConfigs, configs, mergeResolver);
