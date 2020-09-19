import {raguVueWebpackBaseConfig} from "./webpack.base.config";
const {merge} = require("webpack-merge");
const nodeExternals = require('webpack-node-externals');



export const raguVueWebpackHydrateConfig = (assetsPrefix: string, developmentEnvironment: boolean = false) =>
    merge(raguVueWebpackBaseConfig(assetsPrefix, developmentEnvironment), developmentEnvironment ? {
      devtool: 'source-map'
    } : {}, {
      externals: nodeExternals({
        allowlist: /\.css$/
      }),
      target: 'web',
    });
