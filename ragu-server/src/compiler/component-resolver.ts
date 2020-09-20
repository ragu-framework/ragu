import {RaguServerConfig} from "../config";
import fs from "fs";
import path from "path";
import {getLogger} from "../..";

export abstract class ComponentResolver {
  constructor(protected readonly config: RaguServerConfig) {
  }

  abstract componentList(): Promise<string[]>;
  abstract componentViewPath(componentName: string): Promise<string>;
  abstract componentHydratePath(componentName: string): Promise<string>;

  async componentViewWebpackEntries() {
    return await this.extractEntries(this.componentViewPath.bind(this));
  }

  async componentHydrateWebpackEntries() {
    return await this.extractEntries(this.componentHydratePath.bind(this));
  }

  private async extractEntries(componentNameToFile: (componentName: string) => Promise<string>) {
    const componentNames = await this.componentList();
    const entries: Record<string, string> = {};

    for (let componentName of componentNames) {
      entries[componentName] = await componentNameToFile(componentName);
    }

    return entries;
  }

  async getDependencies(_: string) {
    return this.config.components.defaultDependencies || [];
  }
}

export class ByFileStructureComponentResolver extends ComponentResolver {
  private static instance: ComponentResolver;

  componentList(): Promise<string[]> {
    return new Promise((resolve, reject) => {
      fs.readdir(this.config.components.sourceRoot, (err, files) => {
        if (err) {
          reject(err);
          return
        }
        resolve(files);
      });
    });
  }

  async componentHydratePath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'hydrate')
  }

  async componentViewPath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'view');
  }

  async getDependencies(componentName: string) {
    const defaultDependencies = await super.getDependencies(componentName);

    const componentDependencies = JSON.parse(await this.dependenciesFileContentOf(componentName));

    return [...defaultDependencies, ...componentDependencies];
  }

  private dependenciesFileContentOf(componentName: string): Promise<string> {
    return new Promise((resolve) => {
      fs.readFile(this.dependenciesPathOf(componentName), (err, data) => {
        if (err) {
          getLogger(this.config).debug(`Component "${componentName}" has no dependencies described.`)
          resolve('[]');
          return;
        }

        getLogger(this.config).debug(`Dependencies found for "${componentName}".`)
        resolve(data.toString());
      })
    });
  }

  private dependenciesPathOf(componentName: string) {
    return path.join(this.config.components.sourceRoot, componentName, 'dependencies.json');
  }

  static getInstance(config: RaguServerConfig) {
    if (!ByFileStructureComponentResolver.instance) {
      ByFileStructureComponentResolver.instance = new ByFileStructureComponentResolver(config);
    }

    return ByFileStructureComponentResolver.instance;
  }
}

export const getComponentResolver = (config: RaguServerConfig): ComponentResolver => {
  return ByFileStructureComponentResolver.getInstance(config);
}
