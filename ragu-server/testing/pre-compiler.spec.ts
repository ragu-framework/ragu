import {
  createDefaultWebpackConfiguration,
  PreCompilationFailFileNotFoundError,
  PreCompilationOutputError,
  RaguServerConfig,
  ViewCompiler
} from "..";
import {merge} from "webpack-merge";
import {emptyDirSync} from "fs-extra";
import {createTestConfig} from "./test-config-factory";
import * as path from "path";


describe('Pre compiler', () => {
  let preCompiler: ViewCompiler;
  let config: RaguServerConfig;

  beforeAll(async () => {
    config = await createTestConfig();
    jest.resetModules();
  });

  beforeEach(() => jest.resetModules());
  afterEach(() => jest.resetModules());

  afterAll(() => {
    emptyDirSync(path.join(config.compiler.output.view, '..'));
  });

  describe('compile component successfully with default configuration', () => {


    beforeAll(async () => {
      preCompiler = new ViewCompiler(config);
      await preCompiler.compileAll();
    });

    it.each(['hello-world', 'with-dependencies-component', 'with-external-dependencies-component'])
    ('compiles "%s" component with the same filename', (component) => {
      const compiled_hello = require('./compiled_components/view/' + component);
      const not_compiled = require('./components/' + component + '/view');

      expect(JSON.stringify(compiled_hello)).toEqual(JSON.stringify(not_compiled));
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

      preCompiler = new ViewCompiler(config);
    });

    it('rejects the promise with a compilation output error', async () => {
      await expect(preCompiler.compileAll()).rejects.toEqual(new PreCompilationOutputError('default', 'hello-world'));
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

      preCompiler = new ViewCompiler(config);
    });

    it('rejects the promise with a not found error', async () => {
      await expect(preCompiler.compileAll()).rejects.toEqual(new PreCompilationFailFileNotFoundError('hello-world'));
    });
  });
});
