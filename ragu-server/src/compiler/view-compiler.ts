import {RaguServerConfig} from "../config";
import webpack from "webpack";
import {createDefaultWebpackConfiguration} from "./webpack-config-factory";
import * as path from "path";
import {merge} from "webpack-merge";
import * as fs from "fs";
import webpackNodeExternals from "webpack-node-externals";
import {getLogger} from "../logging/get-logger";


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
  constructor(readonly config: RaguServerConfig) {
  }

  async compileAll(): Promise<void> {
    const components = fs.readdirSync(this.config.components.sourceRoot);

    await this.compileComponent(components);
  }

  private compileComponent(componentNames: string[]) {
    return new Promise<void>((resolve, reject) => {
      let webpackConfig = this.getWebpackConfig();

      getLogger(this.config).info('Preparing components.');
      getLogger(this.config).debug('Components found:');

      const allComponentsPath: string[] = componentNames
          .map((componentName) => path.join(this.config.compiler.output.view, componentName));

      for (let componentName of componentNames) {
        getLogger(this.config).debug('-', componentName)
        webpackConfig = merge(webpackConfig, {
          entry: {
            [componentName]: path.join(this.config.components.sourceRoot, componentName, 'view')
          }
        });
      }

      getLogger(this.config).info(`Pre-compiler watch mode is ${webpackConfig.watch ? 'on' : 'off'}`);

      if (webpackConfig.watch) {
        getLogger(this.config).warn(`Watcher is on. Does not use this mode under production.`);
        getLogger(this.config).debug(`Pre compiler is watching components at "${this.config.components.sourceRoot}"`);
      }

      webpack(webpackConfig, (err, stats) => {
        if (err) {
          return reject(err);
        }
        if (stats.hasErrors()) {
          const statsJson = stats.toJson('minimal');
          statsJson.errors.forEach(error => console.error(error));
          return reject(stats);
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
          for (let componentPath of allComponentsPath) {
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
