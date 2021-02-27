import {RaguServerConfig, StateComponentResolver, TemplateComponentResolverByFileStructure} from "ragu-server";
import * as path from 'path';
import * as fs from 'fs';

export class VueComponentResolver extends StateComponentResolver {
  clientSideResolverTemplate: string = path.join(__dirname, 'resolvers', 'hydrate-resolver');
  stateResolverTemplate: string = path.join(__dirname, 'resolvers', 'state-resolver');
  serverSideResolverTemplate: string = path.join(__dirname, 'resolvers', 'view-resolver');

  stateFileFor(componentName: string): string {
    return path.join(this.serverSideFileFor(componentName), 'state');
  }

  serverSideFileFor(componentName: string): string {
    return path.join(this.config.components.sourceRoot, componentName);
  }

  clientSideFileFor(componentName: string): string {
    return this.serverSideFileFor(componentName);
  }
}

export class VueComponentResolver2 extends TemplateComponentResolverByFileStructure {
  constructor(config: RaguServerConfig) {
    super(config);
  }

  async clientSideTemplateFor(componentName: string): Promise<string> {
    const componentPath = path.join(this.config.components.sourceRoot, componentName);

    return `
module.exports.default = {
  async hydrate(el, props, state) {
    this.app = await require('${componentPath}').default.render(props, state);

    this.app.$mount(el.firstChild);
  },
  disconnect() {
    this.app.$destroy(true);
  }
}
`;
  }

  async serverSideTemplateFor(componentName: string): Promise<string> {
    const componentPath = path.join(this.config.components.sourceRoot, componentName);

    return `const vueServerRenderer = require("vue-server-renderer");

module.exports.default = {
  async render(props) {
    const state = ${await this.stateTemplate(componentPath)};
    const app = await require('${componentPath}').default.render(props, state);
    const renderer = vueServerRenderer.createRenderer();

    return {
      state: state,
      html: await renderer.renderToString(app)
    }
  }
}    
`;
  }

  async stateTemplate(componentPath: string) {
    const files: string[] = await fs.promises.readdir(componentPath);
    const statePath = path.join(componentPath, 'state');

    const fileExists = files.find((filename) => {
      const extension = path.extname(filename);

      return filename.replace(extension, '').toLowerCase() === 'state';
    });

    if (!fileExists) {
      return 'null';
    }

    return `await require('${statePath}').default.propsToState(props)`
  }
}
