import {TemplateComponentResolver} from "../..";
import path from "path";

export class TestTemplateComponentResolver extends TemplateComponentResolver {
  async viewTemplateFor(componentName: string): Promise<string> {
    const componentRender = path.join(this.config.components.sourceRoot, componentName, 'render');

    return `exports.default = {
  render(props, state) {
    return require('${componentRender}').default.render(props, state) + '!!!';
  }
} `;
  }

  async hydrateTemplateFor(componentName: string): Promise<string> {
    const componentRender = path.join(this.config.components.sourceRoot, componentName, 'render');

    return `exports.default = {
  hydrate(props, state) {
    return require('${componentRender}').default.render(props, state) + '!!!';
  }
} `;
  }
}
