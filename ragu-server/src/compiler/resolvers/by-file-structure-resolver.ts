import fs from "fs";
import path from "path";
import {Dependency, getLogger, RaguServerConfig} from "../../..";
import {ComponentResolver} from "./component-resolver";

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

  async componentClientSidePath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'client-side')
  }

  async componentServerSidePath(componentName: string): Promise<string> {
    return path.join(this.config.components.sourceRoot, componentName, 'server-side');
  }

  async componentsOnlyDependencies(componentName: string): Promise<Dependency[]> {
    return JSON.parse(await this.dependenciesFileContentOf(componentName));
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
