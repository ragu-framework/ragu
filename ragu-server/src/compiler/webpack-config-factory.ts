import webpack from "webpack";
const path = require('path');
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
      new webpack.IgnorePlugin(/jsdom/),
      new webpack.IgnorePlugin(/mutationobserver-shim/),
    ],
    module: {
      rules: [
        {
          test: /\.*.ts$/,
          use: 'ts-loader',
          exclude: [
            /node_modules/
          ],
        },
      ],
    },
    resolve: {
      extensions: ['.ts', '.js', '.json']
    },
    output: {
      filename: '[name].[contenthash].js',
      path: path.resolve('./dist'),
      publicPath: '/'
    },
    optimization: {
      usedExports: true,
      minimizer: getMinimizer()
    },
    node: {
      net: 'empty',
      fs: 'empty',
      tls: 'empty',
      process: false,
      child_process: 'empty',
      jsdom: 'empty',
      'mutationobserver-shim': 'empty',
    }
  };
}
