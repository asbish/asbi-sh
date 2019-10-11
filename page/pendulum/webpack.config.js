const path = require('path');
const express = require('express');
const webpack = require('webpack');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const HTMLPlugin = require('html-webpack-plugin');
const LicenseWebpackPlugin = require('license-webpack-plugin')
  .LicenseWebpackPlugin;
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const PostCSSPresetEnv = require('postcss-preset-env');
const PostCSSPresetEnvConfig = require('shared/build/postcss-preset-env.config.js');

const isDev = process.env.NODE_ENV === 'development';

module.exports = {
  mode: isDev ? 'development' : 'production',

  entry: {
    pendulum: './src/index.ts'
  },

  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath: isDev ? '/' : '/pendulum/',
    filename: isDev ? '[name].js' : '[name]-[hash].js'
  },

  resolve: {
    extensions: ['.ts', '.js']
  },

  externals: {
    three: 'THREE',
    'three/examples/jsm/loaders/GLTFLoader': 'THREE'
  },

  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader,
            options: {
              hmr: isDev
            }
          },
          {
            loader: 'css-loader'
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                PostCSSPresetEnv({
                  ...PostCSSPresetEnvConfig,
                  browsers: 'last 1 Chrome version,last 1 Firefox version'
                })
              ]
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new MiniCSSExtractPlugin({
      filename: 'inline/[name].css'
    }),
    new HTMLPlugin(
      isDev
        ? {
            template: path.resolve(__dirname, 'index.dev.html')
          }
        : {
            inject: false,
            template: path.resolve(__dirname, 'index.html')
          }
    ),
    isDev &&
      new webpack.SourceMapDevToolPlugin({
        filename: '[name].js.map',
        include: ['pendulum.js']
      }),
    !isDev &&
      new LicenseWebpackPlugin({
        chunkIncludeExcludeTest: {
          include: ['pendulum']
        },
        outputFilename: '[name]-[hash].js.license'
      })
  ].filter(Boolean),

  optimization: {
    namedModules: isDev,
    noEmitOnErrors: isDev,
    minimizer: [
      new TerserPlugin({
        extractComments: false,
        terserOptions: {
          compress: {
            inline: 1
          },
          mangle: {
            safari10: true
          },
          output: {
            safari10: true
          }
        }
      }),
      new OptimizeCSSAssetsPlugin()
    ]
  },

  devServer: {
    contentBase: path.resolve(__dirname, 'dist'),
    compress: true,
    host: '0.0.0.0',
    port: 3000,
    before: app => {
      app.use(express.static('../../static/'));
    }
  }
};
