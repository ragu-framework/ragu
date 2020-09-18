import webpack from "webpack";

const path = require('path');
const {VueLoaderPlugin} = require("vue-loader");

const MiniCSSExtractPlugin = require('mini-css-extract-plugin');

console.log(path.join(__dirname, '..', '..', 'node_modules'));

export const raguVueWebpackBaseConfig = (developmentEnvironment: boolean = false): webpack.Configuration => {
  return {
    mode: 'production',
    resolve: {
      extensions: [ '.js', '.vue', '.ts' ],
      alias: {
        'vue$': 'vue/dist/vue.runtime.min.js',
      }
    },
    module: {
      rules: [
        {
          test: /\.vue$/,
          loader: 'vue-loader',
          exclude: /node_modules/,
          options: {
            optimizeSSR: true,
            extractCSS: true
          }
        },
        {
          test: /\.js$/,
          loader: 'babel-loader',
          exclude: /node_modules/,
        },
        {
          test: /\.(png|svg|jpg|gif)$/,
          exclude: /node_modules/,
          loader: 'file-loader',
          options: {
            esModule: false,
          },
        },
        {
          test: /\.css$/,
          exclude: /node_modules/,
          use: [
            developmentEnvironment ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: developmentEnvironment } },
          ],
        },
        {
          test: /\.scss$/,
          exclude: /node_modules/,
          use: [
            developmentEnvironment ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: developmentEnvironment } },
            { loader: 'sass-loader', options: { sourceMap: developmentEnvironment } }
          ]
        },
        {
          test: /\.sass$/,
          exclude: /node_modules/,
          use: [
            developmentEnvironment ? 'vue-style-loader' : MiniCSSExtractPlugin.loader,
            { loader: 'css-loader', options: { sourceMap: developmentEnvironment } },
            { loader: 'sass-loader', options: { sourceMap: developmentEnvironment } }
          ]
        }
      ]
    },
    plugins: [
      new VueLoaderPlugin(),
      new MiniCSSExtractPlugin(),
    ]
  }
}
