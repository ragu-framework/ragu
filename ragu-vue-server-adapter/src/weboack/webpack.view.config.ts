import {raguVueWebpackBaseConfig} from "./webpack.base.config";

const {merge} = require("webpack-merge");
const nodeExternals = require('webpack-node-externals');

export const raguVueWebpackViewConfig = (developmentEnvironment: boolean = false) => merge(raguVueWebpackBaseConfig(developmentEnvironment), {
  target: 'node',

  devtool: 'source-map',

  output: {
    libraryTarget: 'commonjs2',
    filename: '[name].js',
  },

  externals: nodeExternals({
    allowlist: /\.css$/
  }),
});
