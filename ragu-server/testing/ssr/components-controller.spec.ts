import {ComponentsCompiler, ComponentsController, ComponentsService} from "../..";
import {createTestConfig} from "../test-config-factory";

describe('Component Controller', () => {
  describe('error handling', () => {
    it('returns a 500 status code when error', async () => {
      const config = await createTestConfig();
      const compiler = new ComponentsCompiler(config);

      class StubService extends ComponentsService {
        constructor() {
          super(config, compiler);
        }

        async renderComponent(): Promise<Record<string, string>> {
          throw new Error('Get out')
        }
      }

      const controller = new ComponentsController(config, compiler, new StubService());

      const response = {
        send: jest.fn()
      } as any;
      await controller.renderComponent({params: {componentName: 'hello-world'}} as any, response)

      expect(response.statusCode).toEqual(500);
    });
  })
});
