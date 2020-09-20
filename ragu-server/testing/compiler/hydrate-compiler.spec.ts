import {HydrateCompiler, LogLevel, RaguServerConfig} from "../..";
import {createTestConfig} from "../test-config-factory";
import jsdom, {ConstructorOptions} from "jsdom";
import fs from "fs";
import {emptyDirSync} from "fs-extra";
import {TestTemplateComponentResolver} from "./test-template-component-resolver";
import * as path from "path";

describe('Hydrate Compiler', () => {
  describe('returning the style', () => {
    it('logs that it was not possible to load the file', async () => {
      const config = await createTestConfig();

      await new HydrateCompiler(config).getStyles('helloWorld').catch(() => {});

      expect(config.server.logging.logger.stub).toHaveBeenCalledWith(LogLevel.error, 'Unable to load the "helloWorld.build-manifest.json" file. Did you build run "ragu-server build" before start?');
    });

    it('returns the list of css files', async () => {
      const config = await createTestConfig();
      config.compiler.output.hydrate = __dirname;

      const styles = await new HydrateCompiler(config).getStyles('hello-world');

      expect(styles).toEqual([
        "http://localhost:3101/component-assets/1.css",
        "http://localhost:3101/component-assets/2.css"
      ]);
    });
  });

  describe('compiling', () => {
    let compiler: HydrateCompiler;
    let dom: jsdom.JSDOM;
    let config: RaguServerConfig;

    beforeAll(async () => {
      config = await createTestConfig();
      compiler = new HydrateCompiler(config);

      await compiler.compileAll();
    });

    afterAll(() => {
      emptyDirSync(config.compiler.output.view);
      emptyDirSync(config.compiler.output.hydrate);
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
    })

    const evalCompiledClient = async (componentName: string) => {
      const url = new URL(await compiler.getClientFileName(componentName));
      const client = fs.readFileSync(url as any).toString();
      eval(client);
    }

    describe('default component resolver', () => {
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

    describe('default component resolver', () => {
      beforeAll(async () => {
        config.components.sourceRoot = path.join(__dirname, 'template-resolver-components');
        config.components.resolver = new TestTemplateComponentResolver(config);

        compiler = new HydrateCompiler(config);
        await compiler.compileAll();
      });

      it('exports compiled component into window', async () => {
        await evalCompiledClient('hello-world');

        const resolvedComponent = (window as any)['test_components_hello-world'].default;
        const div = dom.window.document.createElement('div');
        resolvedComponent.hydrate(div, {name: 'World'}, {greetingType: 'Hello'});

        expect(div.textContent).toContain('Hello, World');
      });
    });
  });
});
