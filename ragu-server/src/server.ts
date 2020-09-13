import express, {Express} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import {ComponentsCompiler} from "./compiler/components-compiler";
import {getLogger} from "./logging/get-logger";
import chalk from "chalk";
import {ComponentsController} from "./ssr/components-controller";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;
  private componentController: ComponentsController;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {
    this.expressApp = express();
    this.componentController = new ComponentsController(this.config, this.compiler);

    this.expressApp.use(config.server.assetsEndpoint, express.static(config.components.output));
    this.expressApp.get('/components/:componentName', async (req, res) => {
      await this.componentController.renderComponent(req, res);
    })
  }

  start(): Promise<void> {
    getLogger(this.config).info('Starting the Ragu Server');

    return new Promise<void>((resolve) => {
      this.server = this.expressApp.listen(this.config.port, () => {
        getLogger(this.config).info(`Ragu Server listening at http://localhost:${this.config.port}`);
        if (!this.config.hideWelcomeMessage) {
          console.log('');
          console.log(chalk.bold(`Welcome to 🔪 RaguServer`));
          console.log(`The application is running at ${chalk.bold.green('http://localhost:' + this.config.port)}`)
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
