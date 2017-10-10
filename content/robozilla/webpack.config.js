const ExtractTextPlugin = require('extract-text-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const path = require('path');

module.exports = {
  entry: {
    robozilla: './src/robozilla.js',
  },
  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: '/',
    filename: 'js/[name].js',
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /node_modules/,
        use: ['babel-loader'],
      },
      {
        test: /\.css$/,
        use: ExtractTextPlugin.extract({
          fallback: 'style-loader',
          use: ['css-loader'],
        }),
      },
      {
        test: /\.(json|jpe?g)$/,
        include: [path.resolve(__dirname, 'assets/bob')],
        use: ['file-loader?name=art/robozilla/bob/[name].[ext]'],
      },
      {
        test: /\.png$/,
        include: [path.resolve(__dirname, 'assets/img')],
        use: ['file-loader?name=art/robozilla/img/[name].[ext]'],
      },
    ],
  },
  resolve: {
    modules: ['node_modules/'],
  },
  externals: {
    three: 'THREE',
  },
  plugins: [
    new ExtractTextPlugin({filename: 'css/[name].css'}),
    new HTMLPlugin({inject: false, template: 'assets/index.html'}),
  ],
};
