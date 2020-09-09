import webpack from "webpack";
import {RaguServerConfig} from "../config";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');

type DependencyType = {
    shouldCompile: true
} | {
    shouldCompile: false;
    useGlobal: string
};

type DependencyCallback = (context: string, dependency: string) => DependencyType;

export const webpackCompile = (entry: string, outputName: string, serverConfig: RaguServerConfig, dependencyCallback: DependencyCallback): Promise<void> => {
    const config = serverConfig.webpackConfig || createDefaultWebpackConfiguration({isDevelopment: false});

    config.output = config.output || {};
    config.output.path = serverConfig.components.output;
    config.output.publicPath = serverConfig.assetsPrefix;
    config.output.jsonpFunction = `wpJsonp_${serverConfig.components.namePrefix}`

    config.plugins = config.plugins || [];
    config.plugins.push(new Chunks2JsonPlugin({ outputDir: serverConfig.components.output, publicPath: config.output.publicPath }))

    config.externals = [
        function(context: any, request: any, callback: any) {
            const dependencyType = dependencyCallback(context, request)
            if (!dependencyType.shouldCompile) {
                return callback(null, dependencyType.useGlobal);
            }
            callback();
        }
    ]

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
