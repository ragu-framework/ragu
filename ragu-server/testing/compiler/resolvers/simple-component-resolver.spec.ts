import {SimpleComponentResolver} from "../../../src/compiler/resolvers/simple-component-resolver";
import {createTestConfig} from "../../test-config-factory";
import {RaguServerConfig} from "../../..";

describe('SimpleComponentResolver', () => {
  const componentPath = './component.ts';

  let simpleComponentResolver: SimpleComponentResolver;

  beforeAll(async () => {
    const config: RaguServerConfig = await createTestConfig();
    simpleComponentResolver = new SimpleComponentResolver(config, componentPath);
  });

  it('returns a fixed client side path', async () => {
    expect(await simpleComponentResolver.componentClientSidePath('')).toEqual(componentPath);
  });

  it('returns a fixed server side path', async () => {
    expect(await simpleComponentResolver.componentServerSidePath('')).toEqual(componentPath);
  });

  it('returns a fixed component list path', async () => {
    expect(await simpleComponentResolver.componentList()).toEqual([componentPath]);
  });

  it('returns an empty dependency list path', async () => {
    expect(await simpleComponentResolver.componentsOnlyDependencies('')).toEqual([]);
  });
});
