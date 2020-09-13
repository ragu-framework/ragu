import {RaguServerConfig} from "../config";
import {Request, Response} from "express";
import {getLogger} from "../logging/get-logger";

export class PreviewController {
  constructor(private readonly config: RaguServerConfig) {
  }

  async renderComponent(req: Request, res: Response) {
    const componentName = req.params.componentName;
    getLogger(this.config).info(`[GET] ${req.path}`);

    const receivedQuery = req.query as Record<string, string>;
    const queryParams = new URLSearchParams(receivedQuery).toString();
    const componentURL = `http://${req.headers.host}/components/${componentName}?${queryParams}"`;

    res.send(`<!doctype html>
      <html lang="en">
      <head>
          <meta charset="UTF-8">
          <meta name="viewport"
                content="width=device-width, user-scalable=no, initial-scale=1.0, maximum-scale=1.0, minimum-scale=1.0">
          <meta http-equiv="X-UA-Compatible" content="ie=edge">
          <title>Ragu Ecommerce</title>
          <script src="${this.config.assetsPrefix}ragu-dom.js"></script>
      </head>
      <body>
          <ragu-component src="${componentURL}></ragu-component>
      </body>
      </html>
    `)
  }
}
