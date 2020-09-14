import * as path from "path";
import * as fs from "fs";
import {ConsoleLogger} from "../../logging/console-logger";

const template = (dirName: string) => `const path = require("path");

const port = parseInt(process.env.PORT || '3101');

module.exports = {
  server: {
    port,
    routes: {
      assets: '/component-assets/'
    },
    previewEnabled: true
  },
  compiler: {
    assetsPrefix: \`http://localhost:\${port}/component-assets/\`,
    watchMode: process.env.WATCH_MODE === 'true',
    webpack: {
      // nodeConfig: if you need some custom transpilation for node environment, adds your webpack config here,
      // browserConfig: if you need some custom transpilation for node environment, adds your webpack config here,
    },
    output: {
      node: path.join(__dirname, 'compiled/node_components'),
      browser: path.join(__dirname, 'compiled/browser_components')
    }
  },
  components: {
    namePrefix: '${dirName}',
    sourceRoot: path.join(__dirname, 'components'),
  },
};
`


export const init = () => {
  const configFile = template(path.basename(process.cwd()));
  const configFilePath = path.join(process.cwd(), 'ragu-config.js');

  const consoleLogger = new ConsoleLogger();
  consoleLogger.info(`Creating file at ${configFilePath}`)

  if (fs.existsSync(configFilePath)) {
    consoleLogger.error('Config file already exists');
    process.exit(1);
  }

  fs.writeFileSync(configFilePath, configFile);
}
