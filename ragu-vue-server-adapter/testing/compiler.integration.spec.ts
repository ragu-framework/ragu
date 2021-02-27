import {ClientSideCompiler, RaguServerConfig, ServerSideCompiler} from "ragu-server";
import {createTestConfig} from "./test-config-factory";
import {VueComponentResolver} from "../component-resolver";
import jsdom, {ConstructorOptions} from "jsdom";
import fs from "fs";

describe('Compiler Integration Test', () => {
  describe('View Compilation', () => {
    let compiler: ServerSideCompiler;
    let config: RaguServerConfig;

    beforeAll(async () => {
      config = await createTestConfig();
      config.components.resolver = new VueComponentResolver(config);

      compiler = new ServerSideCompiler(config);
      await compiler.compileAll();
    });

    it('renders the vue component', async () => {
      const {default: compiledComponent} = require(compiler.compiledComponentPath('hello-world'));
      const renderResult = await compiledComponent.render({name: 'Hello, World!'});

      expect(renderResult.html).toContain('Hello, World!');
      expect(renderResult.html).toContain('For a guide and recipes on how to configure / customize this project');
    });

    it('renders the vue component with a state', async () => {
      const {default: compiledComponent} = require(compiler.compiledComponentPath('hello-world-state'));
      const renderResult = await compiledComponent.render({name: 'World'});

      expect(renderResult.state).toEqual({msg: 'Hello, World!'});
      expect(renderResult.html).toContain('Hello, World!');
      expect(renderResult.html).toContain('For a guide and recipes on how to configure / customize this project');
    });
  });

  describe('Hydrate Compilation', () => {
    let compiler: ClientSideCompiler;
    let config: RaguServerConfig;
    let dom: jsdom.JSDOM;


    beforeAll(async () => {
      config = await createTestConfig();
      config.components.resolver = new VueComponentResolver(config);

      compiler = new ClientSideCompiler(config);
      await compiler.compileAll();
    });

    beforeEach(() => {
      const options: ConstructorOptions = {
        url: config.compiler.assetsPrefix,
        resources: 'usable',
        runScripts: 'dangerously',
      }
      dom = new jsdom.JSDOM(undefined, options);

      (global as any).window = dom.window;
      (global as any).document = dom.window.document;
    });

    const evalCompiledClient = async (componentName: string) => {
      const url = new URL(await compiler.getClientFileName(componentName));
      const client = fs.readFileSync(url as any).toString();
      eval(client);
    }

    it('exports compiled component into window', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');

      div.innerHTML = ''; // Simulate the SSR content;

      await resolvedComponent.hydrate(div, {name: 'Hello, World'});

      expect(div.textContent).toContain('Hello, World');
      expect(div.textContent).toContain('For a guide and recipes on how to configure / customize this project');
    });

    it('renders a component', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');

      div.innerHTML = ''; // Simulate the SSR content;

      await resolvedComponent.render(div, {name: 'Hello, World'});

      expect(div.textContent).toContain('Hello, World');
      expect(div.textContent).toContain('For a guide and recipes on how to configure / customize this project');
    });

    it('rehydrates state', async () => {
      await evalCompiledClient('hello-world-state');

      const resolvedComponent = (window as any)['test_components_hello-world-state'].default;
      const div = dom.window.document.createElement('div');

      div.innerHTML = ''; // Simulate the SSR content;

      await resolvedComponent.hydrate(div, {name: 'World'}, {msg: 'Hello, World'});

      expect(div.textContent).toContain('Hello, World');
      expect(div.textContent).toContain('For a guide and recipes on how to configure / customize this project');
    });

    it('destroys component', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');

      div.innerHTML = '<div></div>'; // Simulate the SSR content;

      await resolvedComponent.hydrate(div, {name: 'Hello, World'});

      // @ts-ignore
      window.stubVueDestroyed = jest.fn();
      resolvedComponent.disconnect(div);

      // @ts-ignore
      expect(window.stubVueDestroyed).toBeCalled();
    });

    it('destroys component when static', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');

      await resolvedComponent.render(div, {name: 'Hello, World'});

      // @ts-ignore
      window.stubVueDestroyed = jest.fn();
      resolvedComponent.disconnect(div);

      // @ts-ignore
      expect(window.stubVueDestroyed).toBeCalled();
    });
  });
});
