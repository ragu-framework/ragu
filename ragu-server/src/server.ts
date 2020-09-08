import express, {Express} from 'express';
import * as http from "http";
import {RaguServerConfig} from "./config";
import * as path from "path";


export class RaguServer {
  readonly expressApp: Express;
  private server?: http.Server;

  constructor(private readonly config: RaguServerConfig) {
    this.expressApp = express();
    this.expressApp.get('/components/:componentName', async (req, res) => {
      const componentName = req.params.componentName;
      const componentPath = path.join(config.components.sourceRoot, componentName)
      try {
        const {default: component} = require(componentPath);

        res.send(await component.ssr(req.query));
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
