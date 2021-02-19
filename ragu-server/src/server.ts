import express, {Express} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import {ComponentsCompiler} from "./compiler/components-compiler";
import {getLogger} from "./logging/get-logger";
import chalk from "chalk";
import {ComponentsController} from "./ssr/components-controller";
import {PreviewController} from "./preview/preview-controller";
import {ComponentRoute, getComponentResolver} from "./compiler/resolvers/component-resolver";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;
  private previewController: PreviewController;
  private componentsController: ComponentsController;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {
    this.expressApp = express();
    this.previewController = new PreviewController(this.config);
    this.componentsController = new ComponentsController(this.config, this.compiler);

    this.registerStaticsController();
    this.registerComponentsController();
  }

  private registerStaticsController() {
    this.expressApp.use(this.config.server.routes.assets, express.static(this.config.compiler.output.clientSide));
  }

  private registerComponentsController() {
    getComponentResolver(this.config).availableRoutes().then((routes) => {
      getLogger(this.config).info(`${routes.length} will be registered`);

      routes.forEach(route => {
        getLogger(this.config).info(`Registering route for ${route.componentName}: ${route.route}`);

        this.registerComponentRoute(route);
        this.registerComponentPreviewRoute(route);
      })
    }).catch((e) => {
      getLogger(this.config).error(`Error during route registration ${e}`);
    });
  }

  private registerComponentRoute(route: ComponentRoute) {
    this.expressApp.get(route.route, async (req, res) => {
      req.params.componentName = route.componentName;
      await this.componentsController.renderComponent(req, res);
    });
  }

  private registerComponentPreviewRoute(route: ComponentRoute) {
    if (this.config.server.previewEnabled) {
      this.expressApp.get(route.preview, async (req, res) => {
        req.params.componentName = route.componentName;
        await this.previewController.renderComponent(req, res);
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
