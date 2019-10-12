/* eslint-disable @typescript-eslint/no-var-requires */

import path from 'path';
import webpack from 'webpack';
import { CleanWebpackPlugin } from 'clean-webpack-plugin';
import HTMLPlugin from 'html-webpack-plugin';
import TerserPlugin from 'terser-webpack-plugin';
import OptimizeCSSAssetsPlugin from 'optimize-css-assets-webpack-plugin';
import MiniCSSExtractPlugin from 'mini-css-extract-plugin';
import { LicenseWebpackPlugin } from 'license-webpack-plugin';
import { BundleAnalyzerPlugin } from 'webpack-bundle-analyzer';

const isDev = process.env.NODE_ENV === 'development';
const isAnalyze = process.env.NODE_ENV === 'analyze';
const publicPath = '/pictures/';

const config: webpack.Configuration = {
  mode: isDev ? 'development' : 'production',

  entry: {
    pictures: './src/index.tsx'
  },

  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath,
    filename: '[name]-[hash].js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css']
  },

  module: {
    rules: [
      {
        test: /\.tsx?$/,
        exclude: /node_modules/,
        use: {
          loader: 'ts-loader'
        }
      },
      {
        test: /\.css$/,
        use: [
          {
            loader: MiniCSSExtractPlugin.loader
          },
          {
            loader: 'css-loader',
            options: {
              modules: {
                mode: 'local',
                localIdentName: '[hash:base64:4]'
              }
            }
          },
          {
            loader: 'postcss-loader',
            options: {
              plugins: () => [
                require('postcss-preset-env')(
                  require('shared/build/postcss-preset-env.config.js')
                )
              ]
            }
          }
        ]
      }
    ]
  },

  plugins: [
    new CleanWebpackPlugin(),
    new webpack.DefinePlugin({
      PUBLIC_PATH: JSON.stringify(publicPath)
    }),
    new MiniCSSExtractPlugin({
      filename: 'inline/[name].css'
    }),
    new HTMLPlugin({
      inject: false,
      template: path.resolve(__dirname, './src/index.html')
    }),
    !isDev &&
      (new LicenseWebpackPlugin({
        chunkIncludeExcludeTest: {
          include: ['pictures']
        },
        outputFilename: '[name]-[hash].js.license',
        excludedPackageTest: name => name === 'shared',
        licenseTypeOverrides: {
          decko: 'MIT'
        },
        licenseTextOverrides: {
          'intersection-observer':
            'https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document'
        }
      }) as any), // eslint-disable-line @typescript-eslint/no-explicit-any
    isAnalyze && new BundleAnalyzerPlugin()
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
  }
};

export default config;
