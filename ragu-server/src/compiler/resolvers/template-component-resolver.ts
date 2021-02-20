import path from "path";
import {ByFileStructureComponentResolver, ComponentResolver, Dependency, getLogger, RaguServerConfig} from "../../..";
import fs from "fs";

export abstract class TemplateComponentResolver extends ComponentResolver {
  abstract serverSideTemplateFor(componentName: string): Promise<string>;

  abstract clientSideTemplateFor(componentName: string): Promise<string>;

  async componentServerSidePath(componentName: string): Promise<string> {
    const template = await this.serverSideTemplateFor(componentName);
    const tempPath = await this.createRaguTempDirectory(componentName);
    const viewPath = path.join(tempPath, 'server-side.js');

    getLogger(this.config).debug(`"${componentName}" view file generated at "${viewPath}" by "${this.constructor.name}"`);

    await fs.promises.writeFile(viewPath, template);
    return viewPath;
  }

  async componentClientSidePath(componentName: string): Promise<string> {
    const template = await this.clientSideTemplateFor(componentName);

    const tempPath = await this.createRaguTempDirectory(componentName);
    const hydratePath = path.join(tempPath, 'client-side.js');

    getLogger(this.config).debug(`"${componentName}" hydrate file generated at "${hydratePath}" by "${this.constructor.name}"`);

    await fs.promises.writeFile(hydratePath, template);
    return hydratePath;
  }

  private async createRaguTempDirectory(componentName: string): Promise<string> {
    const baseComponentDirectory = this.config.components.resolverOutput || path.join(process.cwd(), '.jig-components');
    const componentDirectory = path.join(baseComponentDirectory, componentName);

    getLogger(this.config).debug(`"${componentName}" output will be generated at "${componentDirectory}"`);

    await fs.promises.mkdir(componentDirectory, {recursive: true});
    return componentDirectory;
  }
}

export abstract class TemplateComponentResolverByFileStructure extends TemplateComponentResolver {
  private readonly byFileStuctureResolver: ByFileStructureComponentResolver;

  constructor(config: RaguServerConfig) {
    super(config);
    this.byFileStuctureResolver = new ByFileStructureComponentResolver(this.config);
  }


  componentList(): Promise<string[]> {
    return this.byFileStuctureResolver.componentList();
  }

  componentsOnlyDependencies(componentName: string): Promise<Dependency[]> {
    return this.byFileStuctureResolver.componentsOnlyDependencies(componentName);
  }
}
