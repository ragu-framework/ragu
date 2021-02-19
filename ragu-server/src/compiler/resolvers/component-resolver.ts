import {RaguServerConfig} from "../../config";

export type Dependency = {
  nodeRequire: string;
  dependency: string;
  globalVariable: string
};

export type ComponentRoute = {
  preview: string;
  route: string;
  componentName: string
};

export abstract class ComponentResolver {
  constructor(protected readonly config: RaguServerConfig) {
  }

  abstract componentList(): Promise<string[]>;
  abstract componentServerSidePath(componentName: string): Promise<string>;
  abstract componentClientSidePath(componentName: string): Promise<string>;
  abstract componentsOnlyDependencies(componentName: string): Promise<Dependency[]>;

  async componentViewWebpackEntries() {
    return await this.extractEntries(this.componentServerSidePath.bind(this));
  }

  async componentHydrateWebpackEntries() {
    return await this.extractEntries(this.componentClientSidePath.bind(this));
  }

  private async extractEntries(componentNameToFile: (componentName: string) => Promise<string>) {
    const componentNames = await this.componentList();
    const entries: Record<string, string> = {};

    for (let componentName of componentNames) {
      entries[componentName] = await componentNameToFile(componentName);
    }

    return entries;
  }

  defaultDependencies(_componentName: string) {
    return this.config.components.defaultDependencies || [];
  }

  async dependenciesOf(componentName: string): Promise<Dependency[]> {
    const defaultDependencies = await this.defaultDependencies(componentName);
    const componentDependencies = await this.componentsOnlyDependencies(componentName);

    return [...defaultDependencies, ...componentDependencies];
  }

  async availableRoutes() {
    const componentList = await this.componentList();
    return componentList.map((componentName) => ({
      route: `/components/${componentName}`,
      preview: `/preview/${componentName}`,
      componentName
    }));
  }
}

export const getComponentResolver = (config: RaguServerConfig): ComponentResolver => {
  const {ByFileStructureComponentResolver} = require("./by-file-structure-resolver");

  if (config.components.resolver) {
    return config.components.resolver;
  }

  return ByFileStructureComponentResolver.getInstance(config);
}
