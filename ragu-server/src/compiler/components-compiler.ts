import {RaguServerConfig} from "../config";
import {ServerSideCompiler} from "./server-side-compiler";
import {PreviewCompiler} from "../..";
import {ClientSideCompiler} from "./client-side-compiler";

export class ComponentsCompiler {
  private readonly serverSideCompiler: ServerSideCompiler;
  private readonly previewCompiler: PreviewCompiler;
  private readonly clientSideCompiler: ClientSideCompiler;

  constructor(
      private readonly config: RaguServerConfig,
      serverSideCompiler?: ServerSideCompiler,
      previewCompiler?: PreviewCompiler,
      clientSideCompiler?: ClientSideCompiler
  ) {
    this.serverSideCompiler = serverSideCompiler || new ServerSideCompiler(config);
    this.previewCompiler = previewCompiler || new PreviewCompiler(this.config);
    this.clientSideCompiler = clientSideCompiler || new ClientSideCompiler(this.config);
  }

  async compileAll() {
    this.config.ssrEnabled && await this.serverSideCompiler.compileAll();
    await this.clientSideCompiler.compileAll();
    await this.previewCompiler.compile();
  }

  getClientFileName(componentName: string): Promise<string> {
    return this.clientSideCompiler.getClientFileName(componentName);
  }

  async getStyles(componentName: string): Promise<String[]> {
    return this.clientSideCompiler.getStyles(componentName);
  }

  compiledViewComponentPath(componentName: string): string {
    return this.serverSideCompiler.compiledComponentPath(componentName);
  }
}
