const path = require('path');
const webpack = require('webpack');
const PnpWebpackPlugin = require('pnp-webpack-plugin');
const CleanWebpackPlugin = require('clean-webpack-plugin').CleanWebpackPlugin;
const LicenseWebpackPlugin = require('license-webpack-plugin')
  .LicenseWebpackPlugin;
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer')
  .BundleAnalyzerPlugin;
const HTMLPlugin = require('html-webpack-plugin');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCSSExtractPlugin = require('mini-css-extract-plugin');
const CSSMinimizerPlugin = require('css-minimizer-webpack-plugin');
const PostCSSPresetEnv = require('postcss-preset-env');
const PostCSSPresetEnvConfig = require('shared/build/postcss-preset-env.config.js');

const isDev = process.env.NODE_ENV === 'development';
const withAnalyzer = process.env.NODE_ENV === 'analyze';

const publicPath = '/pictures/';

module.exports = {
  mode: isDev ? 'development' : 'production',

  entry: {
    pictures: './src/index.tsx'
  },

  output: {
    path: path.resolve(__dirname, './dist/'),
    publicPath,
    filename: '[name]-[contenthash].js'
  },

  resolve: {
    extensions: ['.ts', '.tsx', '.js', '.css'],
    plugins: [PnpWebpackPlugin]
  },

  resolveLoader: {
    plugins: [PnpWebpackPlugin.moduleLoader(module)]
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
              postcssOptions: {
                plugins: [PostCSSPresetEnv(PostCSSPresetEnvConfig)]
              }
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
      minify: false,
      template: path.resolve(__dirname, './src/index.html')
    }),
    !isDev &&
      new LicenseWebpackPlugin({
        chunkIncludeExcludeTest: {
          include: ['pictures']
        },
        outputFilename: '[name].js.license',
        excludedPackageTest: (name) => name === 'shared',
        licenseTypeOverrides: {
          decko: 'MIT'
        },
        licenseTextOverrides: {
          'intersection-observer':
            'https://www.w3.org/Consortium/Legal/2015/copyright-software-and-document'
        }
      }),
    withAnalyzer && new BundleAnalyzerPlugin()
  ].filter(Boolean),

  optimization: {
    moduleIds: isDev ? 'named' : 'natural',
    emitOnErrors: !isDev,
    minimize: !isDev,
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
      new CSSMinimizerPlugin()
    ]
  }
};
