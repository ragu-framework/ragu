import webpack from "webpack";
import {RaguServerConfig} from "../config";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import {getLogger} from "../logging/get-logger";
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');

type DependencyType = {
    shouldCompile: true
} | {
    shouldCompile: false;
    useGlobal: string
};

type DependencyCallback = (context: string, dependency: string) => DependencyType;

export const webpackCompile = (componentsEntry: Record<string, string>, serverConfig: RaguServerConfig, dependencyCallback: DependencyCallback): Promise<void> => {
    const config = serverConfig.compiler.webpack?.hydrate || createDefaultWebpackConfiguration({isDevelopment: false});

    config.output = config.output || {};
    config.output.path = serverConfig.compiler.output.hydrate;
    config.output.publicPath = serverConfig.compiler.assetsPrefix;
    config.output.jsonpFunction = `wpJsonp_${serverConfig.components.namePrefix}`;
    config.output.library = `${serverConfig.components.namePrefix}[name]`;
    config.output.libraryTarget = 'window';
    config.watch = serverConfig.compiler.watchMode;
    config.plugins = config.plugins || [];
    config.plugins.push(new Chunks2JsonPlugin({ outputDir: serverConfig.compiler.output.hydrate, publicPath: config.output.publicPath }))

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
                ...componentsEntry,
            },
        }, (err, stats) => {
            if (err) {
                getLogger(serverConfig).error('Error during compilation', err);
                return reject(err);
            }
            if (stats.hasErrors()) {
                const statsJson = stats.toJson('minimal');
                statsJson.errors.forEach(error => {
                    getLogger(serverConfig).error('Error during compilation', error);
                });
                return reject(stats);
            }

            resolve();
        });
    })
}
