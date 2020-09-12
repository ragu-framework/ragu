import path from "path";
import getPort from "get-port";
import {
  PreCompilationFailFileNotFoundError,
  PreCompilationOutputError,
  PreCompiler
} from "../src/compiler/pre-compiler";
import {merge} from "webpack-merge";
import {createDefaultWebpackConfiguration} from "..";
import {emptyDir, emptyDirSync} from "fs-extra";

describe('Pre compiler', () => {
  let port: number;
  let preCompiler: PreCompiler;
  const outputDirectory = path.join(__dirname, 'compiled_components');
  const preCompiledOutput = path.join(__dirname, 'pre_compiled_components');

  describe('compile component successfully with default configuration', () => {
    afterAll(async () => {
      await emptyDir(preCompiledOutput);
    });

    beforeAll(async () => {
      port = await getPort();

      const config = {
        assetsPrefix: `http://localhost:${port}/component-assets/`,
        server: {
          assetsEndpoint: '/component-assets/'
        },
        components: {
          preCompiledOutput,
          namePrefix: 'test_components_',
          output: outputDirectory,
          sourceRoot: path.join(__dirname, 'components'),
        },
        port
      };

      preCompiler = new PreCompiler(config);
      await preCompiler.compileAll();
    });

    it.each(['hello-world', 'with-dependencies-component', 'with-external-dependencies-component'])
    ('compiles "%s" component with the same filename', (component) => {
      const compiled_hello = require('./pre_compiled_components/' + component);
      const not_compiled = require('./components/' + component);

      expect(JSON.stringify(compiled_hello)).toEqual(JSON.stringify(not_compiled));
    });
  });

  describe('providing a pre compiler webpack configuration with no exports', () => {
    const preCompiledOutput = path.join(__dirname, 'pre_compiled_components_with_webpack_wrong_config');

    afterEach(async () => {
      await emptyDirSync(preCompiledOutput);
    });

    beforeEach(async () => {
      await emptyDirSync(preCompiledOutput);

      port = await getPort();

      preCompiler = new PreCompiler({
        webpackPreCompilerConfiguration: merge(
            createDefaultWebpackConfiguration({}), {
              output: {
                libraryTarget: 'var',
                filename: '[name].js',
                path: preCompiledOutput,
              },
            }),
        assetsPrefix: `http://localhost:${port}/component-assets/`,
        server: {
          assetsEndpoint: '/component-assets/'
        },
        components: {
          preCompiledOutput,
          namePrefix: 'test_components_',
          output: outputDirectory,
          sourceRoot: path.join(__dirname, 'components'),
        },
        port
      });
    });

    it('rejects the promise with a compilation output error', async () => {
      await expect(preCompiler.compileAll()).rejects.toEqual(new PreCompilationOutputError('default', 'hello-world'));
    });
  });

  describe('providing a pre compiler webpack configuration that does not generates a not found', () => {
    const preCompiledOutput = path.join(__dirname, 'pre_compiled_components_not_found');

    afterEach(async () => {
      await emptyDirSync(preCompiledOutput);
    });

    beforeEach(async () => {
      await emptyDirSync(preCompiledOutput);

      port = await getPort();

      preCompiler = new PreCompiler({
        webpackPreCompilerConfiguration: merge(
            createDefaultWebpackConfiguration({}), {
              output: {
                filename: 'zucchini.js',
                path: preCompiledOutput,
              },
            }),
        assetsPrefix: `http://localhost:${port}/component-assets/`,
        server: {
          assetsEndpoint: '/component-assets/'
        },
        components: {
          preCompiledOutput,
          namePrefix: 'test_components_',
          output: outputDirectory,
          sourceRoot: path.join(__dirname, 'components'),
        },
        port
      });
    });

    it('rejects the promise with a not found error', async () => {
      await expect(preCompiler.compileAll()).rejects.toEqual(new PreCompilationFailFileNotFoundError('hello-world'));
    });
  });
});
