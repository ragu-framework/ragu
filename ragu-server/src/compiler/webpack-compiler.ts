import webpack from "webpack";
import {RaguServerConfig} from "../config";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import {getLogger} from "../logging/get-logger";
import {merge} from "webpack-merge";
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');

type DependencyType = {
    shouldCompile: true
} | {
    shouldCompile: false;
    useGlobal: string
};

type DependencyCallback = (context: string, dependency: string) => DependencyType;

export const webpackCompile = (componentsEntry: Record<string, string>, serverConfig: RaguServerConfig, dependencyCallback: DependencyCallback): Promise<void> => {
    const baseConfig = serverConfig.compiler.webpack?.hydrate || createDefaultWebpackConfiguration({isDevelopment: false});

    const webpackConfig = merge(baseConfig, {
        entry: {
            ...componentsEntry,
        },
        output: {
            path: serverConfig.compiler.output.hydrate,
            publicPath: serverConfig.compiler.assetsPrefix,
            jsonpFunction: `wpJsonp_${serverConfig.components.namePrefix}`,
            library: `${serverConfig.components.namePrefix}[name]`,
            libraryTarget: 'window',
        },
        watch: serverConfig.compiler.watchMode,
        plugins: [
            new Chunks2JsonPlugin({
                outputDir: serverConfig.compiler.output.hydrate,
                publicPath: serverConfig.compiler.assetsPrefix
            })
        ],
        externals: [
            function(context: any, request: any, callback: any) {
                const dependencyType = dependencyCallback(context, request)
                if (!dependencyType.shouldCompile) {
                    return callback(null, dependencyType.useGlobal);
                }
                callback();
            }
        ]
    });

    return new Promise<void>((resolve, reject) => {
        webpack(webpackConfig, (err, stats) => {
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
