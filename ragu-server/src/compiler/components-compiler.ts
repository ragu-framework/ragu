import {RaguServerConfig} from "../config";
import {ViewCompiler} from "./view-compiler";
import {PreviewCompiler} from "../..";
import {HydrateCompiler} from "./hydrate-compiler";

export class ComponentsCompiler {
  private readonly viewCompiler: ViewCompiler;
  private readonly previewCompiler: PreviewCompiler;
  private readonly hydrateCompiler: HydrateCompiler;

  constructor(
      private readonly config: RaguServerConfig,
      viewCompiler?: ViewCompiler,
      previewCompiler?: PreviewCompiler,
      hydrateCompiler?: HydrateCompiler
  ) {
    this.viewCompiler = viewCompiler || new ViewCompiler(config);
    this.previewCompiler = previewCompiler || new PreviewCompiler(this.config);
    this.hydrateCompiler = hydrateCompiler || new HydrateCompiler(this.config);
  }

  async compileAll() {
    this.config.ssrEnabled && await this.viewCompiler.compileAll();
    await this.hydrateCompiler.compileAll();
    await this.previewCompiler.compile();
  }

  getClientFileName(componentName: string): Promise<string> {
    return this.hydrateCompiler.getClientFileName(componentName);
  }

  async getStyles(componentName: string): Promise<String[]> {
    return this.hydrateCompiler.getStyles(componentName);
  }

  compiledViewComponentPath(componentName: string): string {
    return this.viewCompiler.compiledComponentPath(componentName);
  }
}
