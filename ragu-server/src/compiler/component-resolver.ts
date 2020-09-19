import {RaguServerConfig} from "../config";
import fs from "fs";
import path from "path";

export abstract class ComponentResolver {
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
}

export class DefaultComponentResolver extends ComponentResolver {
  private static instance: ComponentResolver;

  constructor(private readonly config: RaguServerConfig) {
    super();
  }

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

  static getInstance(config: RaguServerConfig) {
    if (!DefaultComponentResolver.instance) {
      DefaultComponentResolver.instance = new DefaultComponentResolver(config);
    }

    return DefaultComponentResolver.instance;
  }
}

export const getComponentResolver = (config: RaguServerConfig): ComponentResolver => {
  return DefaultComponentResolver.getInstance(config);
}
