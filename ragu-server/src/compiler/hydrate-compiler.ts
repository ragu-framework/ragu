import {RaguServerConfig} from "../config";
import * as fs from "fs";
import * as path from "path";
import {webpackCompile} from "./webpack-compiler";
import {getLogger} from "../logging/get-logger";

type DependencyObject = { nodeRequire: string, globalVariable: string };

export class HydrateCompiler {
  constructor(private readonly config: RaguServerConfig) {
  }

  async compileAll() {
    getLogger(this.config).info('Starting compile hydrate components...');

    const dependencies: DependencyObject[] = this.fetchAllComponents()
        .flatMap<DependencyObject>((componentName) => require(path.join(this.config.compiler.output.view, componentName)).default?.dependencies || [])
        .filter((dependency) => dependency !== undefined);

    const componentsEntry: Record<string, string> = this.fetchAllComponents()
        .reduce<Record<string, string>>((acc, component) => ({...acc, [component]: path.join(this.config.components.sourceRoot, component, 'hydrate') }), {});

    await webpackCompile(
        componentsEntry,
        this.config,
        (context, requestedDependency) => {
          const foundDependency: DependencyObject | undefined = dependencies.find((dependency) => dependency.nodeRequire.toLowerCase() === requestedDependency.toLocaleLowerCase());

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

  private fetchAllComponents(): string[] {
    return fs.readdirSync(this.config.components.sourceRoot);
  }

  async getClientFileName(componentName: string): Promise<string> {
    const manifest = await this.getManifestFile();
    return manifest?.[componentName]?.js?.[0];
  }

  async getStyles(componentName: string): Promise<string[]> {
    const manifest = await this.getManifestFile();
    return manifest?.[componentName]?.css || [];
  }

  private getManifestFile(): Promise<any> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.config.compiler.output.hydrate, 'build-manifest.json'), (err, data) => {
        if (err) {
          reject(err);
          getLogger(this.config).error('Unable to load the "build-manifest.json" file. Did you build run "ragu-server build" before start?');
          return;
        }
        const manifest = JSON.parse(data.toString());
        resolve(manifest);
      });
    });
  }
}
