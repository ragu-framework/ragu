import {TestLogger} from "./test-logger";
import getPort from "get-port";
import {createBaseConfig, RaguServerConfig} from "..";
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

  const config = createBaseConfig(__dirname);

  config.server.logging.logger = new TestLogger();
  config.server.hideWelcomeMessage = true;
  config.server.port = port;
  config.compiler.assetsPrefix = `file://${config.compiler.output.hydrate}/`;
  config.components.sourceRoot = path.join(__dirname, 'components');
  config.components.namePrefix = 'test_components_';

  return config as TestConfig;
}
