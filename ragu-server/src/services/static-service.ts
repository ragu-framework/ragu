import {RaguServerConfig} from "../config";
import fs from 'fs/promises';
import path from 'path';
import {ComponentRenderService} from "./component-render-service";

export class StaticService {
  private renderService: ComponentRenderService;

  constructor(private readonly config: RaguServerConfig) {
    this.renderService = new ComponentRenderService(this.config);
  }

  async generateStatic(componentName: string, client: string, styles: string[]) {
    const renderResult = await this.renderService.renderComponent(componentName, styles, '', client);
    await fs.writeFile(path.resolve(this.config.compiler.output.directory, `${componentName}.json`), JSON.stringify(renderResult));
  }
}
