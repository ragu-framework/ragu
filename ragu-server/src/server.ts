import express, {Express} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import {ComponentsCompiler} from "./compiler/components-compiler";
import {getLogger} from "./logging/get-logger";
import chalk from "chalk";
import {ComponentsController} from "./ssr/components-controller";
import {PreviewController} from "./preview/preview-controller";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {
    this.expressApp = express();

    this.registerStaticsController();
    this.registerComponentsController();
    this.registerPreviewController();
  }

  private registerStaticsController() {
    this.expressApp.use(this.config.server.routes.assets, express.static(this.config.compiler.output.browser));
  }

  private registerComponentsController() {
    const componentController = new ComponentsController(this.config, this.compiler);

    this.expressApp.get('/components/:componentName', async (req, res) => {
      await componentController.renderComponent(req, res);
    });
  }

  private registerPreviewController() {
    if (this.config.server.previewEnabled) {
      const previewController = new PreviewController(this.config);
      this.expressApp.get('/preview/:componentName', async (req, res) => {
        await previewController.renderComponent(req, res);
      });
    }
  }

  start(): Promise<void> {
    getLogger(this.config).info('Starting the Ragu Server');

    return new Promise<void>((resolve) => {
      this.server = this.expressApp.listen(this.config.server.port, () => {
        getLogger(this.config).info(`Ragu Server listening at http://localhost:${this.config.server.port}`);
        if (!this.config.server.hideWelcomeMessage) {
          console.log('');
          console.log(chalk.bold(`Welcome to 🔪 RaguServer`));
          console.log(`The application is running at ${chalk.bold.green('http://localhost:' + this.config.server.port)}`)
        }
        resolve();
      })
    });
  }

  stop() {
    return new Promise((resolve) => {
      this.server?.close(() => {
        resolve()
      })
    });
  }
}
