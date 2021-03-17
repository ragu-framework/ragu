import {TemplateComponentResolverByFileStructure} from "./template-component-resolver";
import path from "path";
import fs from "fs";
import {RaguServerConfig} from "../../config";
import {Dependency} from "./component-resolver";


interface InternalStateComponentResolverProps {
  serverSideFileFor(componentName: string): string;
  clientSideFileFor(componentName: string): string;
  stateFileFor(componentName: string): string | undefined;
  serverSideResolverTemplate: string;
  clientSideResolverTemplate: string;
  stateResolverTemplate: string;
}


class InternalStateComponentResolver {
  constructor(private readonly props: InternalStateComponentResolverProps) {
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.props.clientSideFileFor(componentName)}');
      var resolver = require('${this.props.clientSideResolverTemplate}');

      module.exports.default = (resolver.default || resolver)(component.default || component);
    `;
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.props.serverSideFileFor(componentName)}');
      var resolver = require('${this.props.serverSideResolverTemplate}');
      var stateResolver = require('${this.props.stateResolverTemplate}');
      var stateResolverFn = (stateResolver.default || stateResolver)(${await this.resolveStateFile(componentName)})
      module.exports.default = (resolver.default || resolver)(component.default || component, stateResolverFn);
    `;
  }

  private async resolveStateFile(componentName: string) {
    const statePath = this.props.stateFileFor(componentName);

    if (statePath === undefined) {
      return 'null';
    }

    const stateFilename = path.basename(statePath);
    const componentPath = path.dirname(statePath);
    const files: string[] = await fs.promises.readdir(componentPath);

    const fileExists = files.find((filename) => {
      const extension = path.extname(filename);

      return filename.replace(extension, '').toLowerCase() === stateFilename;
    });

    if (!fileExists) {
      return 'null';
    }

    return `require('${statePath}').default || require('${statePath}')`
  }
}


export abstract class StateComponentResolver extends TemplateComponentResolverByFileStructure {
  abstract serverSideFileFor(componentName: string): string;

  abstract clientSideFileFor(componentName: string): string;

  abstract stateFileFor(componentName: string): string;

  abstract serverSideResolverTemplate: string;
  abstract clientSideResolverTemplate: string;
  abstract stateResolverTemplate: string;

  constructor(config: RaguServerConfig) {
    super(config);
  }

  private get resolver() {
    return new InternalStateComponentResolver({
      clientSideFileFor: this.clientSideFileFor.bind(this),
      stateFileFor: this.stateFileFor.bind(this),
      serverSideFileFor: this.serverSideFileFor.bind(this),
      clientSideResolverTemplate: this.clientSideResolverTemplate,
      stateResolverTemplate: this.stateResolverTemplate,
      serverSideResolverTemplate: this.serverSideResolverTemplate,
    })
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.clientSideTemplateFor(componentName);
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.serverSideTemplateFor(componentName);
  }
}


export abstract class StateComponentSingleComponentResolver extends TemplateComponentResolverByFileStructure {
  private readonly componentName: string;

  abstract serverSideResolverTemplate: string;
  abstract clientSideResolverTemplate: string;
  abstract stateResolverTemplate: string;

  constructor(
      config: RaguServerConfig,
      private readonly clientSideFile: string,
      private readonly serverSideFile: string,
      private readonly stateFile?: string) {
    super(config);
    this.componentName = path.basename(clientSideFile);
  }

  private get resolver() {
    return new InternalStateComponentResolver({
      clientSideFileFor: this.clientSideFileFor.bind(this),
      stateFileFor: this.stateFileFor.bind(this),
      serverSideFileFor: this.serverSideFileFor.bind(this),
      clientSideResolverTemplate: this.clientSideResolverTemplate,
      stateResolverTemplate: this.stateResolverTemplate,
      serverSideResolverTemplate: this.serverSideResolverTemplate,
    })
  }

  clientSideFileFor(): string {
    return this.clientSideFile;
  }

  stateFileFor(): string | undefined {
    return this.stateFile;
  }

  serverSideFileFor(): string {
    return this.serverSideFile;
  }

  componentRouteOf() {
    if (this.config.static) {
      return `/${this.componentName}.json`
    }
    return '/'
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.clientSideTemplateFor(componentName);
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.serverSideTemplateFor(componentName);
  }


  async componentList(): Promise<string[]> {
    return [this.componentName];
  }

  async componentsOnlyDependencies(): Promise<Dependency[]> {
    return [];
  }


  async availableRoutes(): Promise<{ preview: string; route: string; componentName: string }[]> {
    return [{
      preview: '/preview',
      route: this.componentRouteOf(),
      componentName: this.componentName
    }];
  }
}
