import {ConsoleLogger, getLogger, RaguServerConfig} from "../..";
import {createTestConfig} from "../test-config-factory";

describe('Logger', () => {
  describe('get logger', () => {
    it('returns the given logger', async () => {
      const config = await createTestConfig();
      expect(getLogger(config)).toEqual(config.server.logging.logger);
    });

    it('returns a console logger given no logger', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const config: RaguServerConfig = await createTestConfig();
      delete config.server.logging;
      expect(getLogger(config)).toBeInstanceOf(ConsoleLogger);
    });

    it('returns always the same instance', async () => {
      jest.spyOn(console, 'log').mockImplementation(() => {});
      const config: RaguServerConfig = await createTestConfig();
      delete config.server.logging;
      expect(getLogger(config)).toBe(getLogger(config));
    });
  });
});
