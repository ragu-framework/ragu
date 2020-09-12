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

export class PreCompiler {
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

      for (let componentName of componentNames) {
        getLogger(this.config).debug('-', componentName)
        webpackConfig = merge(webpackConfig, {
          entry: {
            [componentName]: path.join(this.config.components.sourceRoot, componentName)
          }
        });
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
        path: this.config.components.preCompiledOutput
      },
      externals: [webpackNodeExternals()],
    };

    if (this.config.webpackPreCompilerConfiguration) {
      return merge(requiredConfig, this.config.webpackPreCompilerConfiguration);
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
    const componentPath = path.join(this.config.components.preCompiledOutput, componentName);

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
