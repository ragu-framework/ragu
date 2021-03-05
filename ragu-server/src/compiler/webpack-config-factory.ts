import webpack from "webpack";
import * as path from "path";

const TerserPlugin = require('terser-webpack-plugin');
const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

interface Options {
  isDevelopment?: boolean
}

export const createDefaultWebpackConfiguration = ({isDevelopment}: Options): webpack.Configuration =>  {
  const developmentPlugins = [];

  if (process.env.SHOW_BUNDLE_REPORT) {
    developmentPlugins.push(new BundleAnalyzerPlugin())
  }

  function getMinimizer() {
    if (isDevelopment) {
      return [];
    }

    return [
      new TerserPlugin({
        parallel: true,
        terserOptions: {
          keep_classnames: true,
          ecma: 6,
        },
      })
    ];
  }

  return {
    mode: isDevelopment ? 'development' : 'production',
    plugins: [
      ...developmentPlugins,
    ],
    module: {
      rules: [
        {
          test: /\.*.tsx?$/,
          use: 'ts-loader',
          exclude: [
            /node_modules/
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json'],
      modules: ['node_modules', path.resolve(__dirname, '..', '..', 'node_modules')],
    },
    resolveLoader: {
      modules: ['node_modules', path.resolve(__dirname, '..', '..', 'node_modules')],
    },
    output: {
      filename: '[name].[contenthash].js',
      publicPath: '/'
    },
    optimization: {
      usedExports: true,
      minimizer: getMinimizer()
    },
  };
}
