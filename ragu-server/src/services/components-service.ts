import {ComponentsCompiler, RaguServerConfig} from "../../index";
import {ComponentRenderService} from "./component-render-service";

export class ComponentsService {
  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {}

  async renderComponent(componentName: string, props: Record<string, unknown>): Promise<Record<string, string>> {
    const client = await this.compiler.getClientFileName(componentName);
    const styles = await this.compiler.getStyles(componentName);
    const componentPath = this.compiler.compiledViewComponentPath(componentName);

    return new ComponentRenderService(this.config)
        .renderComponent(componentName, styles, componentPath, client, props)
  }
}
