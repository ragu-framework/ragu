import * as path from "path";
import {ComponentsCompiler} from "../src/compiler/components-compiler";
import * as fs from "fs";
import * as jsdom from "jsdom";
import {ConstructorOptions} from "jsdom";
import {emptyDir} from "fs-extra";

describe('Server Side Rendering', () => {
  let port: number = 8080;
  let compiler: ComponentsCompiler;
  const outputDirectory = path.join(__dirname, 'compiled_components');
  const preCompiledOutput = path.join(__dirname, 'pre_compiled_components');
  let dom: jsdom.JSDOM;

  beforeAll(async () => {
    compiler = new ComponentsCompiler({
      assetsPrefix: `file://${outputDirectory}/`,
      server: {
        assetsEndpoint: '/components/'
      },
      components: {
        preCompiledOutput,
        namePrefix: 'test_components_',
        output: outputDirectory,
        sourceRoot: path.join(__dirname, 'components')
      },
      port
    });

    await compiler.compileAll();
  });

  afterAll(() => {
    emptyDir(outputDirectory);
  });

  beforeEach(() => {
    const options: ConstructorOptions = {
      url: `file://${outputDirectory}`,
      resources: 'usable',
      runScripts: 'dangerously',
    }
    dom = new jsdom.JSDOM(undefined, options);

    (global as any).window = dom.window;
    (global as any).document = dom.window.document;
  })

  const evalCompiledClient = async () => {
    const url = new URL(await compiler.getClientFileName());
    const client = fs.readFileSync(url as any).toString();
    eval(client);
  }

  it('exports compiled component into window', async () => {
    await evalCompiledClient();

    const resolvedComponent = await (window as any)['test_components_hello-world'].resolve();
    const div = dom.window.document.createElement('div');
    resolvedComponent.hydrate(div, {name: 'World'}, {greetingType:'Hello'});

    expect(div.textContent).toContain('Hello, World');
  });

  it('exports all dependencies without load the module', async () => {
    await evalCompiledClient();

    const dependencies = (window as any)['test_components_hello-world'].dependencies;

    expect(dependencies).toEqual([
      {
        'nodeRequire': 'react',
        'globalVariable': 'React',
        'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }
    ]);
  });

  describe('with dependencies', () => {
    it('resolves the dependency', async () => {
      await evalCompiledClient();

      const resolvedComponent = await (window as any)['test_components_with-dependencies-component'].resolve();
      const div = dom.window.document.createElement('div');
      resolvedComponent.hydrate(div, {name: 'World'});

      expect(div.textContent).toContain('Hello, World');
    });
  });

  describe('with external dependencies', () => {
    it('uses the defined dependency', async () => {
      await evalCompiledClient();

      (global as any).jQuery = jest.fn(() => ({
        'on': () => {}
      }));

      const resolvedComponent = await (window as any)['test_components_with-external-dependencies-component'].resolve();
      const div = dom.window.document.createElement('div');
      resolvedComponent.hydrate(div, {name: 'World'});

      expect(jQuery).toBeCalled();
    });
  });
});
