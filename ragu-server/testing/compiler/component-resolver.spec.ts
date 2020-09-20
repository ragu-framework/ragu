import {ByFileStructureComponentResolver, ComponentResolver, RaguServerConfig} from "../..";
import {createTestConfig} from "../test-config-factory";
import * as path from "path";

describe('Component Resolver', () => {
  let componentResolver: ComponentResolver;
  let config: RaguServerConfig;

  describe('ByFileStructureComponentResolver', () => {
    beforeAll(async () => {
      config = await createTestConfig();
      componentResolver = new ByFileStructureComponentResolver(config);
    });

    it('singleton returns always the same instance (as it is expected of a singleton)', () => {
      expect(ByFileStructureComponentResolver.getInstance(config))
          .toBe(ByFileStructureComponentResolver.getInstance(config))
    });

    it('list all components', async () => {
      await expect(componentResolver.componentList()).resolves.toEqual([
          'hello-world',
          'with-dependencies-component',
          'with-external-dependencies-component'
      ]);
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
      const dependencies =  await componentResolver.getDependencies('with-dependencies-component');

      expect(dependencies).toHaveLength(0);
    });

    it('returns default dependencies from config', async () => {
      const configDependencies = [{
        'nodeRequire': 'react',
        'globalVariable': 'React',
        'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }];

      config.components.defaultDependencies = configDependencies;
      const dependencies =  await componentResolver.getDependencies('with-dependencies-component');

      expect(dependencies).toEqual(configDependencies);
    });

    it('returns components dependencies from dependencies json', async () => {
      config.components.defaultDependencies = [{
        'nodeRequire': 'react-dom',
        'globalVariable': 'ReactDOM',
        'dependency': 'https://unpkg.com/react-dom@16/umd/react-dom.production.min.js'
      }];
      const dependencies =  await componentResolver.getDependencies('with-external-dependencies-component');

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
});
