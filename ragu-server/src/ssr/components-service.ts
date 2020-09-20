import {RaguServerConfig} from "../..";
import {getLogger} from "../..";
import {ComponentsCompiler} from "../..";
import {getComponentResolver} from "../..";

export class ComponentsService {
  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {}

  async renderComponent(componentName: string, props: Record<string, unknown>): Promise<Record<string, string>> {
    const componentPath = this.compiler.compiledViewComponentPath(componentName);

    getLogger(this.config).debug(`fetching "${componentName}" from "${componentPath}"`);

    const {default: component} = require(componentPath);
    const renderResult = await component.render(props);
    return {
      ...renderResult,
      props,
      dependencies: await getComponentResolver(this.config).dependenciesOf(componentName),
      client: await this.compiler.getClientFileName(componentName),
      styles: await this.compiler.getStyles(componentName),
      resolverFunction: `${this.config.components.namePrefix}${componentName}`
    };

  }
}
