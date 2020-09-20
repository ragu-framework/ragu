import {RaguServerConfig} from "../config";
import webpack from "webpack";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import * as path from "path";
import {merge} from "webpack-merge";
import webpackNodeExternals from "webpack-node-externals";
import {getLogger} from "../logging/get-logger";
import {ComponentResolver, getComponentResolver} from "./component-resolver";


export class PreCompilationOutputError extends Error {
  constructor(readonly key: string, readonly componentName: string) {
    super(`Compilation Error! The component "${componentName}" does not exports ${key}. Verify your webpack configuration. The compilation must result in a commonjs module.`);
  }
}

export class PreCompilationFailFileNotFoundError extends Error {
  constructor(readonly componentName: string) {
    super(`Compilation Error! The component "${componentName}" was not found at the pre-compiler output path. Verify your webpack configuration. The compilation must result in a commonjs module.`);
  }
}

export class ViewCompiler {
  private readonly componentResolver: ComponentResolver;

  constructor(readonly config: RaguServerConfig) {
    this.componentResolver = getComponentResolver(this.config);
  }

  async compileAll(): Promise<void> {
    const components = await this.componentResolver.componentList();

    await this.compileComponent(components);
  }

  private async compileComponent(componentNames: string[]) {
    let webpackConfig = this.getWebpackConfig();

    getLogger(this.config).info('Preparing components.');
    getLogger(this.config).debug('Components found:');

    webpackConfig = merge(webpackConfig, {
      entry: await this.componentResolver.componentViewWebpackEntries()
    });

    const viewOutputFiles: string[] = componentNames
        .map((componentName) => path.join(this.config.compiler.output.view, componentName));


    getLogger(this.config).info(`Pre-compiler watch mode is ${webpackConfig.watch ? 'on' : 'off'}`);

    if (webpackConfig.watch) {
      getLogger(this.config).warn(`Watcher is on. Does not use this mode under production.`);
    }

    return new Promise<void>((resolve, reject) => {
      webpack(webpackConfig, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats.hasErrors()) {
          const statsJson = stats.toJson('minimal');
          statsJson.errors.forEach(error => {
            getLogger(this.config).error('Error during compilation', error);
          });
          return reject(statsJson);
        }

        getLogger(this.config).info('Pre compilation finish. Checking for components health...');
        for (let componentName of componentNames) {
          try {
            this.checkCompilationResult(componentName);
          } catch (e) {
            reject(e);
          }
        }

        if (webpackConfig.watch) {
          for (let componentPath of viewOutputFiles) {
            const fileToInvalidateCache = require.resolve(componentPath);
            getLogger(this.config).info(`Invalidating cache of ${fileToInvalidateCache}`);
            delete require.cache[fileToInvalidateCache]
          }
        }

        getLogger(this.config).info('Pre compilation finish. All check passes...');
        resolve();
      });
    });
  }

  compiledComponentPath(componentName: string): string {
    return path.join(this.config.compiler.output.view, componentName) + '.js';
  }

  private getWebpackConfig() {
    const requiredConfig: Partial<webpack.Configuration> = {
      target: "node",
      output: {
        libraryTarget: "commonjs2",
        filename: '[name].js',
        path: this.config.compiler.output.view
      },
      externals: [webpackNodeExternals()],
      watch: this.config.compiler.watchMode
    };

    if (this.config.compiler.webpack?.view) {
      return merge(requiredConfig, this.config.compiler.webpack.view);
    }

    return merge(createDefaultWebpackConfiguration({}), requiredConfig);
  }

  private checkCompilationResult(componentName: string) {
    getLogger(this.config).debug(`Checking "${componentName}" health...`);
    const component = this.getCompiledComponent(componentName);

    if (!('default' in component)) {
      getLogger(this.config).error(`Component "${componentName}" does not have a default exportation.`);
      throw new PreCompilationOutputError('default', componentName);
    }

    getLogger(this.config).debug(`All check passed from "${componentName}" component`);
  }

  private getCompiledComponent(componentName: string) {
    const componentPath = path.join(this.config.compiler.output.view, componentName);

    try {
      getLogger(this.config).debug(`Loading component "${componentName}" from "${componentPath}"`);
      const component = require(componentPath);
      getLogger(this.config).debug(`Component "${componentName}" loaded.`);
      return component;
    } catch (e) {
      getLogger(this.config).error(`Fail during load component ${componentName} from ${componentPath}. Check your webpack configuration.`);
      throw new PreCompilationFailFileNotFoundError(componentName);
    }
  }
}
