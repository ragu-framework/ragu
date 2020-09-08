import webpack from "webpack";
import {RaguServerConfig} from "../config";
const config = require('./webpack.config');
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');


export const webpackCompile = (entry: string, outputName: string, serverConfig: RaguServerConfig): Promise<void> => {
    config.output.path = serverConfig.components.output;
    config.output.publicPath = serverConfig.assetsPrefix;
    config.output.jsonpFunction = `wpJsonp_${serverConfig.components.namePrefix}`
    config.plugins.push(new Chunks2JsonPlugin({ outputDir: serverConfig.components.output, publicPath: config.output.publicPath }))

    return new Promise<void>((resolve, reject) => {
        webpack({
            ...config,
            entry: {
                [outputName]: entry
            },
        }, (err, stats) => {
            if (err) {
                console.log(err);
                return reject(err);
            }
            if (stats.hasErrors()) {
                const statsJson = stats.toJson('minimal');
                statsJson.errors.forEach(error => console.error(error));
                return reject(stats);
            }

            resolve();
        });
    })
}
