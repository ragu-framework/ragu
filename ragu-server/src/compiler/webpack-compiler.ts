import webpack from "webpack";
import {RaguServerConfig} from "../config";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import {getLogger} from "../logging/get-logger";
import {merge} from "webpack-merge";
import LiveReloadPlugin from "webpack-livereload-plugin";
const Chunks2JsonPlugin = require('chunks-2-json-webpack-plugin');

type DependencyType = {
    shouldCompile: true
} | {
    shouldCompile: false;
    useGlobal: string
};

const webpack4ExternalFunction = (dependencyCallback: any, componentEntry: string) =>
    (context: any, request: any, callback: any) => {
        const dependencyType = dependencyCallback(componentEntry, context, request)
        if (!dependencyType.shouldCompile) {
            return callback(null, dependencyType.useGlobal);
        }
        callback();
    }

const webpack5ExternalFunction = (dependencyCallback: any, componentEntry: string) =>
    ({context, request}: any, callback: any) => {
        webpack4ExternalFunction(dependencyCallback, componentEntry)(context, request, callback)
    }

const isWebpack5 = webpack.version.startsWith('5');

const webpackExternalFunction: any = isWebpack5
    ? webpack5ExternalFunction
    : webpack4ExternalFunction;

type DependencyCallback = (componentName: string, context?: string, dependency?: string) => DependencyType;

export const webpackCompile = (componentsEntry: Record<string, string>, serverConfig: RaguServerConfig, dependencyCallback: DependencyCallback): Promise<void> => {
    const baseConfig = serverConfig.compiler.webpack?.clientSide || createDefaultWebpackConfiguration({isDevelopment: false});

    getLogger(serverConfig).info(`You are using webpack version ${webpack.version}`);

    const outputConfigWebpack4 = isWebpack5 ? {} : {
        jsonpFunction: `wpJsonp_${serverConfig.components.namePrefix}`,
    }

    const webpackConfigs: webpack.Configuration[] = [];

    for (const componentEntry of Object.keys(componentsEntry)) {
        const liveReloadOptions = {
            port: 0,
            appendScriptTag: true,
            quiet: true
        };

        const watcherPlugins = serverConfig.compiler.watchMode ? [
            new LiveReloadPlugin(liveReloadOptions)
        ] : [];

        webpackConfigs.push(merge(baseConfig, {
            entry: {
                [componentEntry]: componentsEntry[componentEntry],
            },
            output: {
                ...outputConfigWebpack4,
                path: serverConfig.compiler.output.clientSide,
                publicPath: serverConfig.compiler.assetsPrefix,
                library: `${serverConfig.components.namePrefix}[name]`,
                libraryTarget: 'window',
            },
            watch: serverConfig.compiler.watchMode,
            plugins: [
                ...watcherPlugins,
                new Chunks2JsonPlugin({
                    filename: `${componentEntry}.build-manifest.json`,
                    outputDir: serverConfig.compiler.output.clientSide,
                    publicPath: serverConfig.compiler.assetsPrefix
                })
            ],
            externals: [
                webpackExternalFunction(dependencyCallback, componentEntry)
            ]
        }))
    }

    return new Promise<void>((resolve, reject) => {
        webpack(webpackConfigs, (err, stats) => {
            if (err) {
                getLogger(serverConfig).error('Error during compilation', err);
                return reject(err);
            }
            if (stats?.hasErrors()) {
                const statsJson = stats.toJson('minimal');
                statsJson.errors?.forEach(error => {
                    getLogger(serverConfig).error('Error during compilation', error);
                });
                return reject(stats);
            }

            resolve();
        });
    })
}
