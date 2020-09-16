import * as path from "path";
import {ComponentsCompiler} from "../src/compiler/components-compiler";
import * as fs from "fs";
import * as jsdom from "jsdom";
import {ConstructorOptions} from "jsdom";
import {TestLogging} from "./test-logging";

describe('Component Compiler', () => {
  let port: number = 8080;
  let compiler: ComponentsCompiler;
  const outputDirectory = path.join(__dirname, 'compiled_components');
  const preCompiledOutput = path.join(__dirname, 'pre_compiled_components');
  let dom: jsdom.JSDOM;

  beforeAll(async () => {
    compiler = new ComponentsCompiler({
      server: {
        routes: {
          assets: '/component-assets/',
        },
        port,
        logging: {
          logger: new TestLogging(),
        }
      },
      components: {
        namePrefix: 'test_components_',
        sourceRoot: path.join(__dirname, 'components'),
      },
      compiler: {
        assetsPrefix: `file://${outputDirectory}/`,
        output: {
          view: preCompiledOutput,
          hydrate: outputDirectory
        },
      }
    });

    await compiler.compileAll();
  });

  afterAll(() => {
    // emptyDir(outputDirectory);
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

  const evalCompiledClient = async (componentName: string) => {
    const url = new URL(await compiler.getClientFileName(componentName));
    const client = fs.readFileSync(url as any).toString();
    eval(client);
  }

  it('exports compiled component into window', async () => {
    await evalCompiledClient('hello-world');

    const resolvedComponent = (window as any)['test_components_hello-world'].default;
    const div = dom.window.document.createElement('div');
    resolvedComponent.hydrate(div, {name: 'World'}, {greetingType:'Hello'});

    expect(div.textContent).toContain('Hello, World');
  });

  describe('with dependencies', () => {
    it('resolves the dependency', async () => {
      await evalCompiledClient('with-dependencies-component');

      const resolvedComponent = (window as any)['test_components_with-dependencies-component'].default;
      const div = dom.window.document.createElement('div');
      resolvedComponent.hydrate(div, {name: 'World'});

      expect(div.textContent).toContain('Hello, World');
    });
  });

  describe('with external dependencies', () => {
    it('uses the defined dependency', async () => {
      (window as any).jQuery = jest.fn(() => ({
        'on': () => {}
      }));

      await evalCompiledClient('with-external-dependencies-component');

      const resolvedComponent = (window as any)['test_components_with-external-dependencies-component'].default;
      const div = dom.window.document.createElement('div');
      resolvedComponent.hydrate(div, {name: 'World'});

      expect((window as any).jQuery).toBeCalled();
    });
  });
});
