import {
  createDefaultWebpackConfiguration,
  PreCompilationFailFileNotFoundError,
  PreCompilationOutputError,
  RaguServerConfig,
  ViewCompiler
} from "../..";
import {createTestConfig} from "../test-config-factory";
import {emptyDirSync} from "fs-extra";
import * as path from "path";
import * as fs from "fs";
import {merge} from "webpack-merge";

describe('View Compiler', () => {
  let compiler: ViewCompiler;
  let config: RaguServerConfig;

  beforeAll(async () => {
    config = await createTestConfig();
    compiler = new ViewCompiler(config);
  });

  afterAll(() => {
    emptyDirSync(path.join(config.compiler.output.view, '..'));
  });

  describe('returning the compiled path', () => {
    it('returns a file inside the path described by output.view configuration', () => {
      const helloPath = compiler.compiledComponentPath('hello-world');
      const helloDirectoryPath = path.dirname(helloPath);

      expect(helloDirectoryPath).toEqual(config.compiler.output.view);
    });

    it('returns the filename with the same name of component name', () => {
      const helloPath = compiler.compiledComponentPath('hello-world');
      const fileName = path.basename(helloPath);

      expect(fileName).toEqual('hello-world.js');
    });
  });

  describe('compiling components', () => {
    beforeAll(async () => {
      await compiler.compileAll();
    });

    it('compiles the component', () => {
      const componentFileAsText = fs.readFileSync(path.join(config.components.sourceRoot, 'hello-world', 'view.ts')).toString();
      const compiledComponentFileAsText = fs.readFileSync(compiler.compiledComponentPath('hello-world')).toString();

      expect(componentFileAsText).not.toEqual(compiledComponentFileAsText);
    });

    it('keeps the behaviour after compilation', () => {
      const {default: component} = require(path.join(config.components.sourceRoot, 'hello-world', 'view.ts'));
      const {default: compiledComponent} = require(compiler.compiledComponentPath('hello-world'));

      expect(component.dependencies).toEqual(compiledComponent.dependencies);
      expect(component.render({name: 'World'})).toEqual(compiledComponent.render({name: 'World'}));
    });
  });

  describe('providing a pre compiler webpack configuration with no exports', () => {
    beforeEach(async () => {
      // impossible to invalidate require.cache
      config.compiler.output.view += '2';
      config.compiler.webpack = {
        view: merge(
            createDefaultWebpackConfiguration({}),
            {
              output: {
                libraryTarget: 'var',
                filename: '[name].js',
                path: config.compiler.output.view,
              },
            }
        ),
      }

      compiler = new ViewCompiler(config);
    });

    it('rejects the promise with a compilation output error', async () => {
      await expect(compiler.compileAll()).rejects.toEqual(new PreCompilationOutputError('default', 'hello-world'));
    });
  });

  describe('providing a pre compiler webpack configuration that does not generates a not found', () => {
    beforeEach(async () => {
      config.compiler.output.view += '3';
      config.compiler.webpack = {
        view: merge(
            createDefaultWebpackConfiguration({}),
            {
              output: {
                libraryTarget: 'var',
                filename: '[name].zucchini.js',
                path: config.compiler.output.view,
              },
            }
        ),
      };

      compiler = new ViewCompiler(config);
    });

    it('rejects the promise with a not found error', async () => {
      await expect(compiler.compileAll()).rejects.toEqual(new PreCompilationFailFileNotFoundError('hello-world'));
    });
  });
});
