import {createConfig} from "..";

describe('Config', () => {
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
