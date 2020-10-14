import {
  ByFileStructureComponentResolver,
  ComponentResolver,
  getComponentResolver,
  RaguServerConfig, StateComponentResolver,
} from "../..";
import {createTestConfig} from "../test-config-factory";
import * as path from "path";
import {TestTemplateComponentResolver} from "./test-template-component-resolver";

describe('Component Resolver', () => {
  let componentResolver: ComponentResolver;
  let config: RaguServerConfig;

  describe('ByFileStructureComponentResolver', () => {
    beforeEach(async () => {
      config = await createTestConfig();
      componentResolver = new ByFileStructureComponentResolver(config);
    });

    it('singleton returns always the same instance (as it is expected of a singleton)', () => {
      expect(getComponentResolver(config)).toBe(getComponentResolver(config))
    });

    it('list all components', async () => {
      await expect(componentResolver.componentList()).resolves.toEqual([
          'hello-world',
          'with-dependencies-component',
          'with-external-dependencies-component'
      ]);
    });

    it('list all components', async () => {
      config.components.sourceRoot = 'not-a-valid-path';
      await expect(componentResolver.componentList().catch((e) => Promise.reject(e.message))).rejects.toMatch('no such file or directory');
    });

    it('returns the view source root of a component', async () => {
      const componentViewPath = await componentResolver.componentViewPath('hello-world');
      expect(path.dirname(componentViewPath)).toEqual(path.join(config.components.sourceRoot, 'hello-world'));
      expect(path.basename(componentViewPath)).toEqual('view');
    });

    it('returns the hydrate source root of a component', async () => {
      const componentViewPath = await componentResolver.componentHydratePath('hello-world');
      expect(path.dirname(componentViewPath)).toEqual(path.join(config.components.sourceRoot, 'hello-world'));
      expect(path.basename(componentViewPath)).toEqual('hydrate');
    });

    it('returns the component dependencies as empty by default', async () => {
      const dependencies =  await componentResolver.dependenciesOf('with-dependencies-component');

      expect(dependencies).toHaveLength(0);
    });

    it('returns default dependencies from config', async () => {
      const configDependencies = [{
        'nodeRequire': 'react',
        'globalVariable': 'React',
        'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }];

      config.components.defaultDependencies = configDependencies;
      const dependencies =  await componentResolver.dependenciesOf('with-dependencies-component');

      expect(dependencies).toEqual(configDependencies);
    });

    it('returns components dependencies from dependencies json', async () => {
      config.components.defaultDependencies = [{
        'nodeRequire': 'react-dom',
        'globalVariable': 'ReactDOM',
        'dependency': 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
      }];
      const dependencies =  await componentResolver.dependenciesOf('with-external-dependencies-component');

      expect(dependencies).toEqual([
        {
          'nodeRequire': 'react-dom',
          'globalVariable': 'ReactDOM',
          'dependency': 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
        },
        {
          "nodeRequire": "jquery",
          "globalVariable": "jQuery",
          "dependency": "http://jquery.cdn.js"
        }
      ]);
    });
  });

  describe('TemplateComponentResolver', () => {
    beforeEach(async () => {
      config = await createTestConfig();
      config.components.sourceRoot = path.join(__dirname, 'template-resolver-components');
      config.components.resolver = new TestTemplateComponentResolver(config);

      componentResolver = getComponentResolver(config);
    });

    it('returns the component resolver described at the config', () => {
      expect(componentResolver).toBe(config.components.resolver);
    });

    it('list all components', async () => {
      await expect(componentResolver.componentList()).resolves.toEqual([
        'hello-world'
      ]);
    });

    it('creates a view file with the specified template', async () => {
      const componentViewPath = await componentResolver.componentViewPath('hello-world');
      const component = require(componentViewPath);

      expect(component.default.render({name: 'World'})).toBe('Hello, World!!!');
    });

    it('creates a hydrate file with the specified template', async () => {
      const componentViewPath = await componentResolver.componentHydratePath('hello-world');
      const component = require(componentViewPath);
      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'})

      expect(el.innerHTML).toBe('Hello, World!!!');
    });
  });

  describe('StateComponentResolver', () => {
    class TestStateComponentResolver extends StateComponentResolver {
      hydrateResolver: string = path.join(__dirname, 'state-resolver', 'hydrate-resolver');
      viewResolver: string = path.join(__dirname, 'state-resolver', 'view-resolver');
      stateResolver: string = path.join(__dirname, 'state-resolver', 'state-resolver');

      hydrateFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-hydrate');
      }

      stateFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-state');
      }

      viewFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-view');
      }
    }

    beforeEach(async () => {
      config = await createTestConfig();
      config.components.sourceRoot = path.join(__dirname, 'state-resolver', 'components');
      config.components.resolver = new TestStateComponentResolver(config);

      componentResolver = getComponentResolver(config);
    });

    it('creates a view file with the specified template', async () => {
      const componentViewPath = await componentResolver.componentViewPath('hello-world');
      const component = require(componentViewPath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('processes the state', async () => {
      const componentViewPath = await componentResolver.componentViewPath('hello-world-state');
      const component = require(componentViewPath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('creates a view file with the specified template with no default exports', async () => {
      (componentResolver as TestStateComponentResolver).viewResolver = path.join(__dirname, 'state-resolver', 'view-resolver-no-default');
      (componentResolver as TestStateComponentResolver).stateResolver = path.join(__dirname, 'state-resolver', 'state-resolver-no-default');

      const componentViewPath = await componentResolver.componentViewPath('hello-world-no-default');
      const component = require(componentViewPath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('creates an hydrate file', async () => {
      const componentHydrate = await componentResolver.componentHydratePath('hello-world');
      const component = require(componentHydrate);

      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'})

      expect(el.innerHTML).toBe('Hello, World!');
    });

    it('creates an hydrate file with no default export', async () => {
      (componentResolver as TestStateComponentResolver).viewResolver = path.join(__dirname, 'state-resolver', 'hydrate-resolver-no-default');
      const componentHydrate = await componentResolver.componentHydratePath('hello-world-no-default');
      const component = require(componentHydrate);

      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'}, {msg: 'Hello, World'})

      expect(el.innerHTML).toBe('Hello, World!');
    });
  });
});
