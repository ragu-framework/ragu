import {RaguServerConfig} from "../config";
import {ViewCompiler} from "./view-compiler";
import {PreviewCompiler} from "../preview/preview-compiler";
import {HydrateCompiler} from "./hydrate-compiler";

export class ComponentsCompiler {
  private readonly viewCompiler: ViewCompiler;
  private readonly previewCompiler: PreviewCompiler;
  private readonly hydrateCompiler: HydrateCompiler;

  constructor(private readonly config: RaguServerConfig) {
    this.viewCompiler = new ViewCompiler(config);
    this.previewCompiler = new PreviewCompiler(this.config);
    this.hydrateCompiler = new HydrateCompiler(this.config);
  }

  async compileAll() {
    await this.viewCompiler.compileAll();
    await this.hydrateCompiler.compileAll();
    await this.previewCompiler.compile();
  }

  getClientFileName(componentName: string): Promise<string> {
    return this.hydrateCompiler.getClientFileName(componentName);
  }
}
