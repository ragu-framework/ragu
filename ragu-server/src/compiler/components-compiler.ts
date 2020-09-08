import {RaguServerConfig} from "../config";
import * as fs from "fs";
import * as path from "path";
import {webpackCompile} from "./webpack-compiler";

interface TemplateConfig {
  componentName: string,
  component: {
    dependencies: unknown
  }
}

const fileTemplate = (config: RaguServerConfig, {componentName, component}: TemplateConfig) => `
  window["${config.components.namePrefix}${componentName}"] = {
    dependencies: ${JSON.stringify(component.dependencies)},
    resolve() {
      return import('${path.join(config.components.sourceRoot, componentName)}')
        .then((module) => module.default);
    }
  };
`;

export class ComponentsCompiler {
  constructor(private readonly config: RaguServerConfig) {
  }

  async compileAll() {
    this.createTypescriptClientFile();
    await webpackCompile(path.join(this.config.components.output, 'original_client.js'), 'client', this.config);
  }

  private createTypescriptClientFile() {
    this.createOutputCompiledComponentsDirectory();
    const components = this.fetchAllComponents().map((componentName) => {
      const component = require(path.join(this.config.components.sourceRoot, componentName)).default;

      return ({
        componentName,
        component
      });
    });

    const tsCodeOfComponent = components.map((component) => fileTemplate(this.config, component)).join('');

    fs.writeFileSync(path.join(this.config.components.output, 'original_client.js'), tsCodeOfComponent);
  }

  private fetchAllComponents(): string[] {
    return fs.readdirSync(this.config.components.sourceRoot);
  }

  private createOutputCompiledComponentsDirectory() {
    if (!fs.existsSync(this.config.components.output)) {
      fs.mkdirSync(this.config.components.output, {
        recursive: true
      });
    }
  }

  getClientFileName(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.config.components.output, 'build-manifest.json'), (err, data) => {
        if (err) {
          reject(err);
        }
        const manifest = JSON.parse(data.toString());
        const clientJsFile = manifest?.client?.js?.[0];

        resolve(clientJsFile);
      });
    })
  }
}
