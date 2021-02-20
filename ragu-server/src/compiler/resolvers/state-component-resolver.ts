import {TemplateComponentResolverByFileStructure} from "./template-component-resolver";
import path from "path";
import fs from "fs";
import {RaguServerConfig} from "../../config";


interface InternalStateComponentResolverProps {
  viewFileFor(componentName: string): string;
  hydrateFileFor(componentName: string): string;
  stateFileFor(componentName: string): string;
  viewResolver: string;
  hydrateResolver: string;
  stateResolver: string;
}


class InternalStateComponentResolver {
  constructor(private readonly props: InternalStateComponentResolverProps) {
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.props.hydrateFileFor(componentName)}');
      var resolver = require('${this.props.hydrateResolver}');

      module.exports.default = (resolver.default || resolver)(component.default || component);
    `;
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.props.viewFileFor(componentName)}');
      var resolver = require('${this.props.viewResolver}');
      var stateResolver = require('${this.props.stateResolver}');
      var stateResolverFn = (stateResolver.default || stateResolver)(${await this.resolveStateFile(componentName)})
      module.exports.default = (resolver.default || resolver)(component.default || component, stateResolverFn);
    `;
  }

  private async resolveStateFile(componentName: string) {
    const statePath = this.props.stateFileFor(componentName);
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
  abstract viewFileFor(componentName: string): string;

  abstract hydrateFileFor(componentName: string): string;

  abstract stateFileFor(componentName: string): string;

  abstract viewResolver: string;
  abstract hydrateResolver: string;
  abstract stateResolver: string;

  constructor(config: RaguServerConfig) {
    super(config);
  }

  private get resolver() {
    return new InternalStateComponentResolver({
      hydrateFileFor: this.hydrateFileFor.bind(this),
      stateFileFor: this.stateFileFor.bind(this),
      viewFileFor: this.viewFileFor.bind(this),
      hydrateResolver: this.hydrateResolver,
      stateResolver: this.stateResolver,
      viewResolver: this.viewResolver,
    })
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.clientSideTemplateFor(componentName);
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return this.resolver.serverSideTemplateFor(componentName);
  }
}
