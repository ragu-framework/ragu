import {RaguServerConfig} from "../config";
import {getComponentResolver, getLogger} from "../..";
import {Request} from "express";

export class ComponentRenderService {
  constructor(private readonly config: RaguServerConfig) {
  }

  async renderComponent(
      componentName: string,
      styles: string[],
      componentPath: string,
      client: string,
      props?: Record<string, unknown>,
      request?: Request
  ): Promise<Record<string, string>> {
    const renderResult = await this.renderResultFor(componentName, componentPath, request, props);

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

  private async renderResultFor(componentName: string,
                                componentPath: string,
                                request?: Request,
                                params: Record<string, unknown> = {}) {
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
    return await component.render({params, isServer: true, config: this.config, request});
  }
}
