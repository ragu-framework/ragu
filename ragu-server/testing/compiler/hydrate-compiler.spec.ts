import {HydrateCompiler} from "../../src/compiler/hydrate-compiler";
import {createTestConfig} from "../test-config-factory";
import {LogLevel} from "../../src/logging/logger";

describe('Hydrate Compiler Unit Tests', () => {
  describe('returning the style', () => {
    it('logs that it was not possible to load the file', async () => {
      const config = await createTestConfig();

      await new HydrateCompiler(config).getStyles('helloWorld').catch(() => {});

      expect(config.server.logging.logger.stub).toHaveBeenCalledWith(LogLevel.error, 'Unable to load the "build-manifest.json" file. Did you build run "ragu-server build" before start?');
    });

    it('returns the list of css files', async () => {
      const config = await createTestConfig();
      config.compiler.output.hydrate = __dirname;

      const styles = await new HydrateCompiler(config).getStyles('hello-world');

      expect(styles).toEqual([
        "http://localhost:3101/component-assets/1.css",
        "http://localhost:3101/component-assets/2.css"
      ]);
    });
  });
})
