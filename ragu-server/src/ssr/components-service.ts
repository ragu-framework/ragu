import {RaguServerConfig} from "../config";
import path from "path";
import {getLogger} from "../logging/get-logger";
import {ComponentsCompiler} from "../compiler/components-compiler";

export class ComponentsService {
  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {}

  async renderComponent(componentName: string, props: Record<string, unknown>): Promise<Record<string, string>> {
    const componentPath = path.join(this.config.compiler.output.node, componentName);

    getLogger(this.config).debug(`fetching "${componentName}" from "${componentPath}"`);

    const {default: component} = require(componentPath);
    const renderResult = await component.render(props);
    return {
      ...renderResult,
      props,
      dependencies: component.dependencies,
      client: await this.compiler.getClientFileName(),
      resolverFunction: `${this.config.components.namePrefix}${componentName}`
    };

  }
}
