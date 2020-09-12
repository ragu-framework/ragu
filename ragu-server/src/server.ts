import express, {Express, Response} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import * as path from "path";
import {ComponentsCompiler} from "./compiler/components-compiler";
import {getLogger} from "./logging/get-logger";
import chalk from "chalk";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {
    this.expressApp = express();

    this.expressApp.use(config.server.assetsEndpoint, express.static(config.components.output));

    this.expressApp.get('/components/:componentName', async (req, res) => {
      const componentName = req.params.componentName;
      const componentPath = path.join(config.components.preCompiledOutput, componentName);

      getLogger(this.config).info(`[GET] ${req.path}`);
      getLogger(this.config).debug(`fetching "${componentName}" from "${componentPath}"`);

      try {
        const {default: component} = require(componentPath);
        const query = {...req.query};
        delete query['callback'];

        const response = await component.render(query);

        res.jsonp({
          ...response,
          props: query,
          dependencies: component.dependencies,
          client: await this.compiler.getClientFileName(),
          resolverFunction: `${this.config.components.namePrefix}${componentName}`
        });
        getLogger(this.config).info(`responding "${req.path}" with 200 status code.`);
      } catch (e) {
        this.handleComponentError(e, componentName, res);
      }
    })
  }

  private handleComponentError(e: any, componentName: any, res: Response) {
    if (e.code === 'MODULE_NOT_FOUND') {
      getLogger(this.config).warn(`component not found: ${componentName}`);
      res.statusCode = 404;
      res.send({
        error: "component not found",
        componentName
      });
      return
    }

    getLogger(this.config).error(`error during processing component ${componentName}`, e);
    res.statusCode = 500;
    res.send({
      error: "error during render the component",
      componentName
    });
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
