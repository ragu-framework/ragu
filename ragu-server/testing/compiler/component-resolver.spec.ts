import {ComponentResolver, DefaultComponentResolver, RaguServerConfig} from "../..";
import {createTestConfig} from "../test-config-factory";
import * as path from "path";

describe('Component Resolver', () => {
  let componentResolver: ComponentResolver;
  let config: RaguServerConfig;

  describe('DefaultComponentResolver', () => {
    beforeAll(async () => {
      config = await createTestConfig();
      componentResolver = DefaultComponentResolver.getInstance(config);
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
  });
});
