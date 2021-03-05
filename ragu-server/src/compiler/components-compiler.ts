import {RaguServerConfig} from "../config";
import {ServerSideCompiler} from "./server-side-compiler";
import {getComponentResolver, PreviewCompiler} from "../..";
import {ClientSideCompiler} from "./client-side-compiler";
import {StaticService} from "../services/static-service";
import {Report} from "../reports/report";

export class ComponentsCompiler {
  private readonly serverSideCompiler: ServerSideCompiler;
  private readonly previewCompiler: PreviewCompiler;
  private readonly clientSideCompiler: ClientSideCompiler;
  private readonly staticService: StaticService;

  constructor(
      private readonly config: RaguServerConfig,
      serverSideCompiler?: ServerSideCompiler,
      previewCompiler?: PreviewCompiler,
      clientSideCompiler?: ClientSideCompiler,
      staticService?: StaticService
  ) {
    this.serverSideCompiler = serverSideCompiler || new ServerSideCompiler(config);
    this.previewCompiler = previewCompiler || new PreviewCompiler(this.config);
    this.clientSideCompiler = clientSideCompiler || new ClientSideCompiler(this.config);
    this.staticService = staticService || new StaticService(this.config);
  }

  async compileAll() {
    this.config.ssrEnabled && await this.serverSideCompiler.compileAll();
    await this.clientSideCompiler.compileAll();
    await this.previewCompiler.compile();

    if (this.config.static) {
      const allComponents = await getComponentResolver(this.config).componentList();

      await Promise.all(allComponents.map(async (componentName) => {
        const clientFileName = await this.getClientFileName(componentName);
        const styles = await this.getStyles(componentName);

        await this.staticService.generateStatic(componentName, clientFileName, styles)
      }));
    }

    await new Report(this.config).reportBuildLocation();
  }

  getClientFileName(componentName: string): Promise<string> {
    return this.clientSideCompiler.getClientFileName(componentName);
  }

  async getStyles(componentName: string): Promise<string[]> {
    return this.clientSideCompiler.getStyles(componentName);
  }

  compiledViewComponentPath(componentName: string): string {
    return this.serverSideCompiler.compiledComponentPath(componentName);
  }
}
