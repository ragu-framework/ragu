import {TestLogger} from "./test-logger";
import getPort from "get-port";
import {createConfig, RaguServerConfig} from "..";
import * as path from "path";

type TestConfig = RaguServerConfig & {
  server: {
    logging: {
      logger: TestLogger
    }
  }
};

export const createTestConfig = async (): Promise<TestConfig> => {
  const port = await getPort();

  const config = createConfig({
    compiler: {
      assetsPrefix: '',
    },
    projectRoot: __dirname,
    environment: "development",
    components: {
      namePrefix: 'test_components_',
      sourceRoot: path.join(__dirname, 'components')
    },
    server: {
      logging: {
        logger: new TestLogger(),
      },
      hideWelcomeMessage: true,
      port
    }
  });

  config.compiler.assetsPrefix = `file://${config.compiler.output.clientSide}/`;

  return config as TestConfig;
}
