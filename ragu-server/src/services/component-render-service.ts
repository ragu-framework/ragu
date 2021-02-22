import {RaguServerConfig} from "../config";
import {getComponentResolver, getLogger} from "../..";

export class ComponentRenderService {
  constructor(private readonly config: RaguServerConfig) {
  }

  async renderComponent(
      componentName: string,
      styles: string[],
      componentPath: string,
      client: string,
      props?: Record<string, unknown>,
  ): Promise<Record<string, string>> {
    const renderResult = await this.renderResultFor(componentName, componentPath, props);

    const componentInfo = {
      dependencies: await getComponentResolver(this.config).dependenciesOf(componentName),
      client,
      ssrEnabled: this.config.ssrEnabled && !this.config.static,
      static: this.config.static,
      styles,
      resolverFunction: `${this.config.components.namePrefix}${componentName}`,
      ...renderResult
    };

    if (props) {
      return {...componentInfo, props}
    }

    return componentInfo;
  }

  private async renderResultFor(componentName: string, componentPath: string, props: Record<string, unknown> = {}) {
    if (this.config.static) {
      getLogger(this.config).debug(`skipping server side rendering: static=true.`);
      return {};
    }

    if (!this.config.ssrEnabled) {
      getLogger(this.config).debug(`skipping server side rendering: ssrEnabled=false.`);

      return {};
    }

    getLogger(this.config).debug(`fetching "${componentName}" from "${componentPath}"`);

    const {default: component} = require(componentPath);
    return await component.render(props);
  }
}
