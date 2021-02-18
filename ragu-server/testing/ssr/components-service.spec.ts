import {createTestConfig} from "../test-config-factory";
import {ComponentsCompiler, ComponentsService, RaguServerConfig} from "../..";
import {emptyDirSync} from "fs-extra";

describe('ComponentService', () => {
  describe('when ssr is disabled', () => {
    let config: RaguServerConfig;

    beforeAll(async () => {
      config = await createTestConfig();
    })

    afterAll(() => {
      emptyDirSync(config.compiler.output.serverSide);
      emptyDirSync(config.compiler.output.clientSide);
    });

    it('returns empty html', async () => {
      config.ssrEnabled = false;

      const compiler = new ComponentsCompiler(config);
      await compiler.compileAll();

      const service = new ComponentsService(config, compiler);
      const component = await service.renderComponent('hello-world', {});

      expect(component.html).toBeUndefined();
      expect(component.ssrEnabled).toBeFalsy();
    });
  });
})
