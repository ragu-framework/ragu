import {TemplateComponentResolver} from "./template-component-resolver";
import path from "path";
import fs from "fs";

export abstract class StateComponentResolver extends TemplateComponentResolver {
  abstract viewFileFor(componentName: string): string;

  abstract hydrateFileFor(componentName: string): string;

  abstract stateFileFor(componentName: string): string;

  abstract viewResolver: string;
  abstract hydrateResolver: string;
  abstract stateResolver: string;

  async clientSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.hydrateFileFor(componentName)}');
      var resolver = require('${this.hydrateResolver}');

      module.exports.default = (resolver.default || resolver)(component.default || component);
    `;
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    return `
      var component = require('${this.viewFileFor(componentName)}');
      var resolver = require('${this.viewResolver}');
      var stateResolver = require('${this.stateResolver}');
      var stateResolverFn = (stateResolver.default || stateResolver)(${await this.resolveStateFile(componentName)})
      module.exports.default = (resolver.default || resolver)(component.default || component, stateResolverFn);
    `;
  }

  async resolveStateFile(componentName: string) {
    const statePath = this.stateFileFor(componentName);
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
