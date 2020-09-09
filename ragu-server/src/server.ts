import express, {Express} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import * as path from "path";
import {ComponentsCompiler} from "./compiler/components-compiler";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;

  constructor(private readonly config: RaguServerConfig, private readonly compiler: ComponentsCompiler) {
    this.expressApp = express();

    this.expressApp.use(config.server.assetsEndpoint, express.static(config.components.output));

    this.expressApp.get('/components/:componentName', async (req, res) => {
      const componentName = req.params.componentName;
      const componentPath = path.join(config.components.sourceRoot, componentName)
      try {
        const {default: component} = require(componentPath);

        const response = await component.ssr(req.query);

        res.jsonp({
          ...response,
          dependencies: component.dependencies,
          client: await this.compiler.getClientFileName(),
          resolverFunction: `${this.config.components.namePrefix}${componentName}`
        });
      } catch (e) {
        console.log(e)
        res.statusCode = 404;
        res.send({
          error: "component not found",
          componentName
        });
      }
    })
  }

  start(): Promise<void> {
    return new Promise<void>((resolve) => {
      this.server = this.expressApp.listen(this.config.port, () => {
        console.log(`Ragu Server listening at http://localhost:${this.config.port}`);
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
