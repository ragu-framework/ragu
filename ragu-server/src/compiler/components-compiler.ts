import {RaguServerConfig} from "../config";
import * as fs from "fs";
import * as path from "path";
import {webpackCompile} from "./webpack-compiler";
import {PreCompiler} from "./pre-compiler";
import {getLogger} from "../logging/get-logger";
import {PreviewCompiler} from "../preview/preview-compiler";

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
      return import('${path.join(config.compiler.output.node, componentName)}')
        .then((module) => module.default);
    }
  };
`;

type DependencyObject = { nodeRequire: string, globalVariable: string };

export class ComponentsCompiler {
  private readonly preCompiler: PreCompiler;
  private readonly previewCompiler: PreviewCompiler;

  constructor(private readonly config: RaguServerConfig, preCompiler?: PreCompiler) {
    this.preCompiler = preCompiler || new PreCompiler(config);
    this.previewCompiler = new PreviewCompiler(this.config);
  }

  async compileAll() {
    await this.preCompiler.compileAll();
    this.createNonCompiledClientFile();

    getLogger(this.config).info('Starting compilation process...');

    const dependencies: DependencyObject[] = this.fetchAllComponents()
        .flatMap<DependencyObject>((componentName) => require(path.join(this.config.compiler.output.node, componentName)).default?.dependencies || [])
        .filter((dependency) => dependency !== undefined);

    // TODO: store this file at the node output
    await webpackCompile(
        path.join(this.config.compiler.output.browser, 'original_client.js'),
        'client',
        this.config,
        (context, requestedDependency) => {
          const foundDependency: DependencyObject | undefined = dependencies.find((dependency) => dependency.nodeRequire === requestedDependency);

          if (foundDependency) {
            getLogger(this.config).debug(`replacing dependency "${requestedDependency}" with global variable "${foundDependency.globalVariable}" from ${context}`);
            return {
              shouldCompile: false,
              useGlobal: foundDependency.globalVariable
            }
          }

          return {
            shouldCompile: true
          }
        });

    await this.previewCompiler.compile();
  }

  private createNonCompiledClientFile() {
    this.createOutputCompiledComponentsDirectory();

    const componentNames = this.fetchAllComponents();

    getLogger(this.config).debug('Components to be compiled: ', componentNames);

    const components = componentNames.map((componentName) => {
      const componentPath = path.join(this.config.compiler.output.node, componentName);

      getLogger(this.config).debug(`Loading "${componentName}" from "${componentPath}".`);

      const component = require(componentPath).default;

      return ({
        componentName,
        component
      });
    });

    getLogger(this.config).debug(`Creating client file template.`);
    const tsCodeOfComponent = components.map((component) => fileTemplate(this.config, component)).join('');

    const originalClientPath = path.join(this.config.compiler.output.browser, 'original_client.js');
    getLogger(this.config).debug(`Writing client file at "${originalClientPath}"`);

    fs.writeFileSync(originalClientPath, tsCodeOfComponent);
  }

  private fetchAllComponents(): string[] {
    return fs.readdirSync(this.config.components.sourceRoot);
  }

  private createOutputCompiledComponentsDirectory() {
    getLogger(this.config).debug('Creating output directory:', this.config.compiler.output.browser);

    if (fs.existsSync(this.config.compiler.output.browser)) {
      getLogger(this.config).debug('Skipping output directory creation: Directory already exists.');
      return;
    }

    fs.mkdirSync(this.config.compiler.output.browser, {
      recursive: true
    });

    getLogger(this.config).debug('Output directory created.');
    return;
  }

  getClientFileName(): Promise<string> {
    return new Promise((resolve, reject) => {
      fs.readFile(path.join(this.config.compiler.output.browser, 'build-manifest.json'), (err, data) => {
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
