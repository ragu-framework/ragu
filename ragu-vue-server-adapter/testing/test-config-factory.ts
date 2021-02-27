import path from "path";
import getPort from "get-port";
import {RaguServerConfig} from "ragu-server";
import {TestLogger} from "./test-logger";
import {raguVueWebpackHydrateConfig, raguVueWebpackViewConfig} from "../webpack";

type TestConfig = RaguServerConfig & {
  server: {
    logging: {
      logger: TestLogger
    }
  }
};

export const createTestConfig = async (): Promise<TestConfig> => {
  const port = await getPort();
  const directory = path.join(__dirname, 'compiled_components');
  const serverOutput = path.join(directory, 'view');
  const clientOutput = path.join(directory, 'hydrate');

  return ({
    baseurl: `file://${directory}`,
    ssrEnabled: true,
    static: true,
    server: {
      routes: {
        assets: '/component-assets/',
      },
      previewEnabled: true,
      hideWelcomeMessage: true,
      port,
      logging: {
        logger: new TestLogger(),
      }
    },
    components: {
      namePrefix: 'test_components_',
      sourceRoot: path.join(__dirname, 'components'),
    },
    compiler: {
      assetsPrefix: `file://${clientOutput}/`,
      webpack: {
        clientSide: raguVueWebpackHydrateConfig(`file://${clientOutput}/`),
        serverSide: raguVueWebpackViewConfig(`file://${clientOutput}/`)
      },
      output: {
        directory,
        serverSide: serverOutput,
        clientSide: clientOutput
      },
    }
  });
}
