import {ComponentsCompiler, getComponentResolver, getLogger, RaguServerConfig} from "../..";

export class ComponentsService {
  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {}

  async renderComponent(componentName: string, props: Record<string, unknown>): Promise<Record<string, string>> {
    const renderResult = await this.renderResultFor(componentName, props);

    return {
      dependencies: await getComponentResolver(this.config).dependenciesOf(componentName),
      client: await this.compiler.getClientFileName(componentName),
      ssrEnabled: this.config.ssrEnabled,
      styles: await this.compiler.getStyles(componentName),
      resolverFunction: `${this.config.components.namePrefix}${componentName}`,
      props,
      ...renderResult
    };

  }

  private async renderResultFor(componentName: string, props: Record<string, unknown>) {
    if (!this.config.ssrEnabled) {
      getLogger(this.config).debug(`skipping server side rendering: ssrEnabled=false.`);

      return {};
    }

    const componentPath = this.compiler.compiledViewComponentPath(componentName);

    getLogger(this.config).debug(`fetching "${componentName}" from "${componentPath}"`);

    const {default: component} = require(componentPath);
    return await component.render(props);
  }
}
