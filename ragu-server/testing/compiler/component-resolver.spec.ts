import {
  ByFileStructureComponentResolver,
  ComponentResolver,
  getComponentResolver,
  RaguServerConfig, StateComponentResolver, StateComponentSingleComponentResolver,
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

    it('returns the server side source root of a component', async () => {
      const componentServerSidePath = await componentResolver.componentServerSidePath('hello-world');
      expect(path.dirname(componentServerSidePath)).toEqual(path.join(config.components.sourceRoot, 'hello-world'));
      expect(path.basename(componentServerSidePath)).toEqual('server-side');
    });

    it('returns the client side source root of a component', async () => {
      const componentClientSidePath = await componentResolver.componentClientSidePath('hello-world');
      expect(path.dirname(componentClientSidePath)).toEqual(path.join(config.components.sourceRoot, 'hello-world'));
      expect(path.basename(componentClientSidePath)).toEqual('client-side');
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

    it('creates a client side file with the specified template', async () => {
      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world');
      const component = require(componentClientSidePath);

      expect(component.default.render({name: 'World'})).toBe('Hello, World!!!');
    });

    it('creates a hydrate file with the specified template', async () => {
      const componentClientSidePath = await componentResolver.componentClientSidePath('hello-world');
      const component = require(componentClientSidePath);
      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'})

      expect(el.innerHTML).toBe('Hello, World!!!');
    });
  });

  describe('StateComponentResolver', () => {
    class TestStateComponentResolver extends StateComponentResolver {
      clientSideResolverTemplate: string = path.join(__dirname, 'state-resolver', 'hydrate-resolver');
      serverSideResolverTemplate: string = path.join(__dirname, 'state-resolver', 'view-resolver');
      stateResolverTemplate: string = path.join(__dirname, 'state-resolver', 'state-resolver');

      clientSideFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-hydrate');
      }

      stateFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-state');
      }

      serverSideFileFor(componentName: string): string {
        return path.join(this.config.components.sourceRoot, componentName, 'my-cool-view');
      }
    }

    beforeEach(async () => {
      config = await createTestConfig();
      config.components.sourceRoot = path.join(__dirname, 'state-resolver', 'components');
      config.components.resolverOutput = path.join(__dirname, '.jig-output-state');
      config.components.resolver = new TestStateComponentResolver(config);

      componentResolver = getComponentResolver(config);
    });

    it('creates a client side file with the specified template', async () => {
      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world');
      const component = require(componentClientSidePath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('processes the state', async () => {
      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world-state');
      const component = require(componentClientSidePath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('creates a client side file with the specified template with no default exports', async () => {
      (componentResolver as TestStateComponentResolver).serverSideResolverTemplate = path.join(__dirname, 'state-resolver', 'view-resolver-no-default');
      (componentResolver as TestStateComponentResolver).stateResolverTemplate = path.join(__dirname, 'state-resolver', 'state-resolver-no-default');

      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world-no-default');
      const component = require(componentClientSidePath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('creates an hydrate file', async () => {
      const componentHydrate = await componentResolver.componentClientSidePath('hello-world');
      const component = require(componentHydrate);

      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'})

      expect(el.innerHTML).toBe('Hello, World!');
    });

    it('creates an hydrate file with no default export', async () => {
      (componentResolver as TestStateComponentResolver).serverSideResolverTemplate = path.join(__dirname, 'state-resolver', 'hydrate-resolver-no-default');
      const componentHydrate = await componentResolver.componentClientSidePath('hello-world-no-default');
      const component = require(componentHydrate);

      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'}, {msg: 'Hello, World'})

      expect(el.innerHTML).toBe('Hello, World!');
    });
  });

  describe('StateComponentSingleComponentResolver', () => {
    class TestStateComponentResolver extends StateComponentSingleComponentResolver {
      clientSideResolverTemplate: string = path.join(__dirname, 'state-resolver', 'hydrate-resolver');
      serverSideResolverTemplate: string = path.join(__dirname, 'state-resolver', 'view-resolver');
      stateResolverTemplate: string = path.join(__dirname, 'state-resolver', 'state-resolver');
    }

    beforeEach(async () => {
      config = await createTestConfig();
      config.components.sourceRoot = path.join(__dirname, 'state-resolver', 'components');
      config.components.resolverOutput = path.join(__dirname, '.jig-output-state');
    });

    it('creates a client side file with the specified template', async () => {
      config.components.resolver = new TestStateComponentResolver(
          config,
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-hydrate'),
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-view'));

      componentResolver = getComponentResolver(config);

      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world');
      const component = require(componentClientSidePath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('returns a fixed route', async () => {
      config.components.resolver = new TestStateComponentResolver(
          config,
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-hydrate'),
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-view'));

      componentResolver = getComponentResolver(config);

      await expect(componentResolver.componentList()).resolves.toEqual(['index']);

      await expect(componentResolver.componentRouteOf('index')).toEqual('/');

      await expect(componentResolver.availableRoutes()).resolves.toEqual([{
        preview: '/preview',
        route: '/',
        componentName: 'index'
      }]);
    });

    it('returns the json route when static', async () => {
      config.static = true;
      config.components.resolver = new TestStateComponentResolver(
          config,
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-hydrate'),
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-view'));

      componentResolver = getComponentResolver(config);

      await expect(componentResolver.componentRouteOf('index')).toEqual('/index.json');
      await expect(componentResolver.availableRoutes()).resolves.toEqual([{
        preview: '/preview',
        route: '/index.json',
        componentName: 'index'
      }]);
    });

    it('processes the state', async () => {
      config.components.resolver = new TestStateComponentResolver(
          config,
          path.join(config.components.sourceRoot, 'hello-world-state', 'my-cool-hydrate'),
          path.join(config.components.sourceRoot, 'hello-world-state', 'my-cool-view'),
          path.join(config.components.sourceRoot, 'hello-world-state', 'my-cool-state')
      );

      componentResolver = getComponentResolver(config);

      const componentClientSidePath = await componentResolver.componentServerSidePath('hello-world-state');
      const component = require(componentClientSidePath);

      await expect(component.default.render({name: 'World'})).resolves.toBe('Hello, World!');
    });

    it('creates an hydrate file', async () => {
      config.components.resolver = new TestStateComponentResolver(
          config,
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-hydrate'),
          path.join(config.components.sourceRoot, 'hello-world', 'my-cool-view'));

      componentResolver = getComponentResolver(config);

      const componentHydrate = await componentResolver.componentClientSidePath('hello-world');
      const component = require(componentHydrate);

      const el = {
        innerHTML: ''
      };

      component.default.hydrate(el, {name: 'World'})

      expect(el.innerHTML).toBe('Hello, World!');
    });
  });
});
