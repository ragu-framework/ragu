import {RaguServerConfig} from "../config";
import * as fs from "fs";
import * as path from "path";
import {webpackCompile} from "./webpack-compiler";
import {PreCompiler} from "./pre-compiler";

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
      return import('${path.join(config.components.preCompiledOutput, componentName)}')
        .then((module) => module.default);
    }
  };
`;

type DependencyObject = { nodeRequire: string, globalVariable: string };

export class ComponentsCompiler {
  private readonly preCompiler: PreCompiler;

  constructor(private readonly config: RaguServerConfig, preCompiler?: PreCompiler) {
    this.preCompiler = preCompiler || new PreCompiler(config);
  }

  async compileAll() {
    await this.preCompiler.compileAll();

    this.createTypescriptClientFile();

    const dependencies: DependencyObject[] = this.fetchAllComponents()
        .flatMap<DependencyObject>((componentName) => require(path.join(this.config.components.sourceRoot, componentName)).default?.dependencies || [])
        .filter((dependency) => dependency !== undefined);

    await webpackCompile(
        path.join(this.config.components.output, 'original_client.js'),
        'client',
        this.config,
        (_, requestedDependency) => {
          const foundDependency: DependencyObject | undefined = dependencies.find((dependency) => dependency.nodeRequire === requestedDependency);

          if (foundDependency) {
            return {
              shouldCompile: false,
              useGlobal: foundDependency.globalVariable
            }
          }

          return {
            shouldCompile: true
          }
        });
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
