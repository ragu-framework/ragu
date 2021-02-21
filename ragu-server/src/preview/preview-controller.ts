import {RaguServerConfig} from "../config";
import {Request, Response} from "express";
import {getLogger} from "../logging/get-logger";
import {RaguClient} from "ragu-client-node";
import {getComponentResolver} from "../..";

require('cross-fetch/polyfill');
require('abort-controller/polyfill');

export class PreviewController {
  constructor(private readonly config: RaguServerConfig) {
  }

  async renderComponent(req: Request, res: Response) {
    const componentName = req.params.componentName;
    getLogger(this.config).info(`[GET] ${req.path}`);

    const receivedQuery = req.query as Record<string, string>;
    const queryParams = new URLSearchParams(receivedQuery).toString();
    const componentURL = `${this.config.baseurl}${getComponentResolver(this.config).componentRouteOf(componentName)}?${queryParams}`;
    const client = new RaguClient();
    const component = await client.fetchComponent(componentURL)

    res.send(`<!doctype html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport"
                content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Ragu preview - ${componentName}</title>
          ${receivedQuery.disableJavascript ? '' : `<script src="${this.config.compiler.assetsPrefix}ragu-dom.js"></script>`}
          ${component.stylesheets()}
      </head>
      <body>
          ${component.toRaguDOM()}
      </body>
      </html>
    `)
  }
}
