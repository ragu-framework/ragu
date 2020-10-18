import {createConfig} from "..";

describe('Config', () => {
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
