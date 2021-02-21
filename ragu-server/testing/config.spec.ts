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

  describe('output', () => {
    it('defines a default client and server side output directory based on projectRoot', () => {
      const config = createConfig({
        projectRoot: '/bla/'
      });

      expect(config.compiler.output.directory).toEqual('/bla/.ragu-components')
      expect(config.compiler.output.clientSide).toEqual('/bla/.ragu-components/compiled/client-side');
      expect(config.compiler.output.serverSide).toEqual('/bla/.ragu-components/compiled/server-side');
    });

    it('defines a default client and server side output directory based on output directory', () => {
      const config = createConfig({
        compiler: {
          output: {
            directory: '/bla'
          }
        }
      });

      expect(config.compiler.output.directory).toEqual('/bla')
      expect(config.compiler.output.clientSide).toEqual('/bla/compiled/client-side');
      expect(config.compiler.output.serverSide).toEqual('/bla/compiled/server-side');
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

  it('does not set a default webpack server side config when one was given', () => {
    const webpackServerSide = {};

    const config = createConfig({
      environment: 'development',
      components: {
        namePrefix: 'test_',
      },
      compiler: {
        assetsPrefix: '/',
        webpack: {
          serverSide: webpackServerSide
        }
      }
    });

    expect(config.compiler.webpack.serverSide).toBe(webpackServerSide);
  });

  it('does not set a default webpack server side config when one was given', () => {
    const webpackClientSide = {};

    const config = createConfig({
      environment: 'development',
      components: {
        namePrefix: 'test_',
      },
      compiler: {
        assetsPrefix: '/',
        webpack: {
          clientSide: webpackClientSide
        }
      }
    });

    expect(config.compiler.webpack.clientSide).toBe(webpackClientSide);
  });
});
