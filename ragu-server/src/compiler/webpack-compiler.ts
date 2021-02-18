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

type DependencyCallback = (componentName: string, context: string, dependency: string) => DependencyType;

export const webpackCompile = (componentsEntry: Record<string, string>, serverConfig: RaguServerConfig, dependencyCallback: DependencyCallback): Promise<void> => {
    const baseConfig = serverConfig.compiler.webpack?.clientSide || createDefaultWebpackConfiguration({isDevelopment: false});

    const webpackConfigs: webpack.Configuration[] = [];

    for (const componentEntry of Object.keys(componentsEntry)) {
        webpackConfigs.push(merge(baseConfig, {
            entry: {
                [componentEntry]: componentsEntry[componentEntry],
            },
            output: {
                path: serverConfig.compiler.output.clientSide,
                publicPath: serverConfig.compiler.assetsPrefix,
                jsonpFunction: `wpJsonp_${serverConfig.components.namePrefix}`,
                library: `${serverConfig.components.namePrefix}[name]`,
                libraryTarget: 'window',
            },
            watch: serverConfig.compiler.watchMode,
            plugins: [
                new Chunks2JsonPlugin({
                    filename: `${componentEntry}.build-manifest.json`,
                    outputDir: serverConfig.compiler.output.clientSide,
                    publicPath: serverConfig.compiler.assetsPrefix
                })
            ],
            externals: [
                function(context: any, request: any, callback: any) {
                    const dependencyType = dependencyCallback(componentEntry, context, request)
                    if (!dependencyType.shouldCompile) {
                        return callback(null, dependencyType.useGlobal);
                    }
                    callback();
                }
            ]
        }))
    }

    return new Promise<void>((resolve, reject) => {
        webpack(webpackConfigs, (err, stats) => {
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
