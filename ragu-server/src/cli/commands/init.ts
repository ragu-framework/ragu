import * as path from "path";
import * as fs from "fs";
import {ConsoleLogger} from "../../logging/console-logger";
import {Logger} from "../../logging/logger";
import chalk from "chalk";
const npm = require('npm-programmatic');

const configTemplate = (projectName: string) => `const path = require("path");

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
      // view: if you need some custom transpilation for node environment, adds your webpack config here,
      // hydrate: if you need some custom transpilation for browser environment, adds your webpack config here,
    },
    output: {
      view: path.join(__dirname, 'compiled/view_components'),
      hydrate: path.join(__dirname, 'compiled/hydrate_components')
    }
  },
  components: {
    namePrefix: '${projectName}',
    sourceRoot: path.join(__dirname, 'components'),
  },
};
`

const packageJsonTemplate = (projectName: string) => `{
  "name": "${projectName}",
  "version": "1.0.0",
  "description": "",
  "main": "index.js",
  "devDependencies": {},
  "scripts": {
     "build": "ragu-server build",
     "start": "ragu-server run",
     "dev": "ragu-server dev"
  },
  "author": "",
  "license": "MIT"
}`

const createRaguConfigFile = (logger: Logger, projectPath: string, projectName: string) => {
  const configFilePath = path.join(projectPath, 'ragu-config.js');

  logger.info(`Creating config file at ${configFilePath}`)
  const configFile = configTemplate(projectName);

  fs.writeFileSync(configFilePath, configFile);
}

const createPackageJson = (logger: Logger, projectPath: string, projectName: string) => {
  const configFilePath = path.join(projectPath, 'package.json');

  logger.info(`Creating package.json at ${configFilePath}`)
  const configFile = packageJsonTemplate(projectName);

  fs.writeFileSync(configFilePath, configFile);
}


const createHelloWorldComponent = (logger: Logger, projectPath: string) => {
  const componentsPath = path.join(projectPath, 'components');
  const componentPath = path.join(projectPath, 'components', 'hello-world');
  logger.info('Creating directory: ', componentPath);
  fs.mkdirSync(componentsPath);
  fs.mkdirSync(componentPath);


  const viewPath = path.join(componentPath, 'view.js');
  fs.writeFileSync(viewPath, `export default {
  render({name}) {
    return {
      html: \`<h1>Hello, \${name}</h1>\`
    }
  }
}`);

  const hydratePath = path.join(componentPath, 'hydrate.js');
  fs.writeFileSync(hydratePath, `export default {
  hydrate(el, {name}) {
    el.addEventListener('click', () => alert('Hello, \${name}!'));
  }
}`);
}


const createProjectDirectory = (logger: Logger, projectPath: string) => {
  if (fs.existsSync(projectPath)) {
    logger.error('Directory already exits: ', projectPath);
    process.exit(1);
  }

  logger.info('Creating directory: ', projectPath);
  fs.mkdirSync(projectPath);
}

export const init = async (projectName: string) => {
  const logger = new ConsoleLogger();

  if (!projectName) {
    logger.error('You must provide a projectName.');
    process.exit(1);

  }
  const projectPath = path.join(process.cwd(), projectName);

  createProjectDirectory(logger, projectPath);
  createPackageJson(logger, projectPath, projectName);
  createRaguConfigFile(logger, projectPath, projectName);
  createHelloWorldComponent(logger, projectPath);

  logger.info('Installing dependencies...');
  await npm.install(['ragu-server'], {
    cwd: projectPath,
    save: true,
    output: true
  });
  logger.info('✅ All set!');
  logger.info(`${chalk.bold('Run the commands bellow to start your 🔪 Ragu application:')}

${chalk.bold('💻 $')} cd ${projectName}
${chalk.bold('💻 $')} npm run dev

${chalk.bold('With the server running, you can take a look at you hello-world ragu component:')}
🌎 http://localhost:3101/preview/hello-world/?name=Ragu
`)
}
