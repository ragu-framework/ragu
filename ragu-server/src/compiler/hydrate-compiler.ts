import {RaguServerConfig} from "../config";
import * as fs from "fs";
import * as path from "path";
import {webpackCompile} from "./webpack-compiler";
import {getLogger} from "../..";
import {ComponentResolver, getComponentResolver} from "./resolvers/component-resolver";

type DependencyObject = { nodeRequire: string, globalVariable: string };

export class HydrateCompiler {
  private componentResolver: ComponentResolver;

  constructor(private readonly config: RaguServerConfig) {
    this.componentResolver = getComponentResolver(config);
  }

  async compileAll() {
    getLogger(this.config).info('Starting compile hydrate components...');

    const componentNames = await this.fetchAllComponents();

    const dependencyMap: Record<string, DependencyObject[]> = {};

    for (let componentName of componentNames) {
      dependencyMap[componentName] = await this.componentResolver.dependenciesOf(componentName);
    }

    const componentEntry: Record<string, string> = await this.componentResolver.componentHydrateWebpackEntries();

    await webpackCompile(
        componentEntry,
        this.config,
        (componentName, context, requestedDependency) => {
          const foundDependency: DependencyObject | undefined = dependencyMap[componentName]?.find((dependency) => dependency.nodeRequire.toLowerCase() === requestedDependency.toLocaleLowerCase());

          if (foundDependency) {
            getLogger(this.config).debug(`replacing dependency "${requestedDependency}" with global variable "${foundDependency.globalVariable}" from ${context}`);
            return {
              shouldCompile: false,
              useGlobal: foundDependency.globalVariable
            }
          }

          return {
            shouldCompile: true
          }
        });
  }

  private async fetchAllComponents(): Promise<string[]> {
    return await this.componentResolver.componentList();
  }

  async getClientFileName(componentName: string): Promise<string> {
    const manifest = await this.getManifestFile(componentName);
    return manifest?.[componentName]?.js?.[0];
  }

  async getStyles(componentName: string): Promise<string[]> {
    const manifest = await this.getManifestFile(componentName);
    return manifest?.[componentName]?.css || [];
  }

  private getManifestFile(componentName: string): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.config.compiler.output.clientSide, `${componentName}.build-manifest.json`), (err, data) => {
        if (err) {
          reject(err);
          getLogger(this.config).error(`Unable to load the "${componentName}.build-manifest.json" file. Did you build run "ragu-server build" before start?`);
          return;
        }
        const manifest = JSON.parse(data.toString());
        resolve(manifest);
      });
    });
  }
}
