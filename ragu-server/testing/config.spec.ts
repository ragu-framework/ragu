import {createConfig} from "..";

describe('Config', () => {
  describe('base url', () => {
    it('defines the default URL with the default port', () => {
      const config = createConfig();

      expect(config.baseurl).toBe('http://localhost:3100');
    });

    it('defines the default URL with the given port', () => {
      const config = createConfig({
        server: {
          port: 3333
        }
      });

      expect(config.baseurl).toBe('http://localhost:3333');
    });
  });

  describe('assets prefix', () => {
    it('defines the default assets source as localhost with the default port', () => {
      const config = createConfig({
        components: {
          namePrefix: "_hi",
        }
      });

      expect(config.compiler.assetsPrefix).toBe('http://localhost:3100/component-assets/');
    });

    it('defines the default assets source as localhost with the given port and assets route', () => {
      const config = createConfig({
        components: {
          namePrefix: "_hi",
        },
        server: {
          port: 6666,
          routes: {
            assets: '/my-assets/'
          }
        },
      });

      expect(config.compiler.assetsPrefix).toBe('http://localhost:6666/my-assets/');
    });

    it('defines the default assets source with the given baseurl', () => {
      const config = createConfig({
        baseurl: 'http://localhost:4444',
        components: {
          namePrefix: "_hi",
        },
        server: {
          port: 6666,
          routes: {
            assets: '/my-assets/'
          }
        },
      });

      expect(config.compiler.assetsPrefix).toBe('http://localhost:4444/my-assets/');
    });
  });

  describe('name prefix', () => {
    it('uses the package.json name as default', () => {
      const config = createConfig();

      expect(config.components.namePrefix).toContain('ragu');
    });

    it('hash is always de same', () => {
      const config = createConfig();

      expect(config.components.namePrefix).toContain(createConfig().components.namePrefix);
    });
  });

  it('does not set a default webpack view config when one was given', () => {
    const webpackView = {};

    const config = createConfig({
      environment: 'development',
      components: {
        namePrefix: 'test_',
      },
      compiler: {
        assetsPrefix: '/',
        webpack: {
          view: webpackView
        }
      }
    });

    expect(config.compiler.webpack.view).toBe(webpackView);
  });

  it('does not set a default webpack hydrate config when one was given', () => {
    const webpackHydrate = {};

    const config = createConfig({
      environment: 'development',
      components: {
        namePrefix: 'test_',
      },
      compiler: {
        assetsPrefix: '/',
        webpack: {
          hydrate: webpackHydrate
        }
      }
    });

    expect(config.compiler.webpack.hydrate).toBe(webpackHydrate);
  });
});
