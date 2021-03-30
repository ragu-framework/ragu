import * as path from "path";
import jsdom, {ConstructorOptions} from "jsdom";
import fs from "fs";
import {ComponentsCompiler} from "../../../src/compiler/components-compiler";
import {RaguServerConfig} from "../../../src/config";
import {createTestConfig} from "../../test-config-factory";
import {CustomSingleComponentResolver} from "../../../src/compiler/resolvers/custom-resolver";
import {ServerSideCompiler} from "../../../src/compiler/server-side-compiler";
import {ComponentRenderService} from "../../../src/services/component-render-service";

describe('CustomComponentResolver', () => {
  let compiler: ComponentsCompiler;
  let config: RaguServerConfig;
  let dom: jsdom.JSDOM;

  const evalCompiledClient = async (componentName: string) => {
    const url = new URL(await compiler.getClientFileName(componentName));
    const client = fs.readFileSync(url as any).toString();
    eval(client);
  }

  describe('client side config', () => {
    beforeAll(async () => {
      config = await createTestConfig();

      let componentFile = path.resolve(__dirname, 'components', 'hello-world');

      config.components.resolver = new CustomSingleComponentResolver(
          config, componentFile);

      compiler = new ComponentsCompiler(config);
      await compiler.compileAll();
    });

    beforeEach(() => {
      const options: ConstructorOptions = {
        url: config.compiler.assetsPrefix,
        resources: 'usable',
        runScripts: 'dangerously',
      }
      dom = new jsdom.JSDOM(undefined, options);

      (global as any).navigator = dom.window.navigator;
      (global as any).window = dom.window;
      (global as any).document = dom.window.document;
    });

    it('renders the component from server', async () => {
      config.ssrEnabled = true;
      const compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const componentPath = compiler.compiledComponentPath('hello-world');

      const renderResult = await new ComponentRenderService(config)
          .renderComponent('hello-world', [], componentPath, "http://", {name: 'World!'}, {} as any);

      expect(renderResult.html).toContain('Hello, World!');
    });

    it('renders the component from server with a state', async () => {
      let componentFile = path.resolve(__dirname, 'components', 'hello-world-state');
      let stateFile = path.resolve(__dirname, 'components', 'state');

      config.components.resolver = new CustomSingleComponentResolver(
          config, componentFile, stateFile);

      config.ssrEnabled = true;

      const compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const componentPath = compiler.compiledComponentPath('hello-world-state');

      const renderResult = await new ComponentRenderService(config)
          .renderComponent('hello-world-state', [], componentPath, "http://", {toBeTranslatedName: 'World!'}, {} as any);

      expect(renderResult.html).toContain('Hello, World!');
    });

    it('hydrates the component from server with a state', async () => {
      config.ssrEnabled = true;
      const compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const componentPath = compiler.compiledComponentPath('hello-world');

      const renderResult = await new ComponentRenderService(config)
          .renderComponent('hello-world', [], componentPath, "http://", {name: 'World!'}, {} as any);

      const div = dom.window.document.createElement('div');
      (div as any).connectedStub = jest.fn();

      div.innerHTML = renderResult.html

      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;

      await resolvedComponent.hydrate(div, {name: 'World'});

      expect(div.textContent).toContain('Hello, World');

      div.click();
      expect((div as any).connectedStub).toBeCalled();
    });

    it('renders a simple component', async () => {
      await evalCompiledClient('hello-world');

      const resolvedComponent = (window as any)['test_components_hello-world'].default;
      const div = dom.window.document.createElement('div');
      (div as any).disconnectedStub = jest.fn();
      (div as any).connectedStub = jest.fn();

      await resolvedComponent.render(div, {name: 'World'});

      expect(div.textContent).toContain('Hello, World');

      div.click();
      expect((div as any).connectedStub).toBeCalled();
      expect((div as any).disconnectedStub).not.toBeCalled();
      resolvedComponent.disconnect(div);
      expect((div as any).disconnectedStub).toBeCalled();
    });
  });

  describe('when providing a wrapper', () => {
    beforeAll(async () => {
      config = await createTestConfig();

      let componentFile = path.resolve(__dirname, 'components', 'hello-world-wrapper');

      class WrapperCustomSingleComponentResolver extends CustomSingleComponentResolver {
        wrapperResolverTemplate = path.join(__dirname, 'wrapper.js');
      }

      config.components.resolver = new WrapperCustomSingleComponentResolver(
          config,
          componentFile
      );

      compiler = new ComponentsCompiler(config);
      await compiler.compileAll();
    });

    beforeEach(() => {
      const options: ConstructorOptions = {
        url: config.compiler.assetsPrefix,
        resources: 'usable',
        runScripts: 'dangerously',
      }
      dom = new jsdom.JSDOM(undefined, options);

      (global as any).navigator = dom.window.navigator;
      (global as any).window = dom.window;
      (global as any).document = dom.window.document;
    });

    it('renders the component from server', async () => {
      config.ssrEnabled = true;
      const compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const componentPath = compiler.compiledComponentPath('hello-world-wrapper');

      const renderResult = await new ComponentRenderService(config)
          .renderComponent('hello-world-wrapper', [], componentPath, "http://", {name: 'World!'}, {} as any);

      expect(renderResult.html).toContain('Hello, World! from custom from server');
    });

    it('hydrates the component from server with a state', async () => {
      config.ssrEnabled = true;
      const compiler = new ServerSideCompiler(config);
      await compiler.compileAll();

      const componentPath = compiler.compiledComponentPath('hello-world-wrapper');

      const renderResult = await new ComponentRenderService(config)
          .renderComponent('hello-world', [], componentPath, "http://", {name: 'World!'}, {} as any);

      const div = dom.window.document.createElement('div');
      (div as any).connectedStub = jest.fn();

      div.innerHTML = renderResult.html

      await evalCompiledClient('hello-world-wrapper');

      const resolvedComponent = (window as any)['test_components_hello-world-wrapper'].default;

      await resolvedComponent.hydrate(div, {name: 'World'});

      expect(div.textContent).toContain('Hello, World from custom from browser');

      div.click();
      expect((div as any).connectedStub).toBeCalled();
    });
  })
});
