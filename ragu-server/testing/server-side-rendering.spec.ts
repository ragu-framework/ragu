import {RaguServer} from "..";
import {ComponentsCompiler} from "..";
import {emptyDirSync} from "fs-extra";
import {RaguServerConfig} from "..";
import {createTestConfig} from "./test-config-factory";

describe('Server Side Rendering', () => {
  let server: RaguServer;
  let compiler: ComponentsCompiler;
  let config: RaguServerConfig;

  beforeAll(async () => {
    config = await createTestConfig();
    config.components.defaultDependencies = [{
      nodeRequire: 'react',
      globalVariable: 'React',
      dependency: 'https://unpkg.com/react@16/umd/react.production.min.js'
    }];
    config.compiler.assetsPrefix = `http://localhost:${config.server.port}/component-assets/`;

    compiler = new ComponentsCompiler(config);
    server = new RaguServer(config, compiler);

    await compiler.compileAll();
    await server.start()
  });

  afterAll(async () => {
    await server.stop();
    emptyDirSync(config.compiler.output.view);
    emptyDirSync(config.compiler.output.hydrate);
  });

  describe('fetching a component successfully', () => {
    let response: Response;
    let responseBody: Record<string, unknown>;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${config.server.port}/components/hello-world?name=World`);
      responseBody = await response.json();
    });

    it('returns 200 as status code', () => {
      expect(response.status).toBe(200);
    });

    it('returns the html of the requested component', async () => {
      expect(responseBody.html).toContain('>Hello, World</b>');
    });

    it('returns the dependencies of the requested component', async () => {
      expect(responseBody.dependencies).toEqual([{
        'nodeRequire': 'react',
        'globalVariable': 'React',
        'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }]);
    });

    it('returns the client file name', async () => {
      const filename = await compiler.getClientFileName("hello-world");
      expect(responseBody.client).toBe(filename);
    });

    it('returns the resolver function', async () => {
      expect(responseBody.resolverFunction).toBe('test_components_hello-world');
    });

    it('returns the state of the requested component', async () => {
      expect(responseBody.state).toEqual({
        greetingType: 'Hello',
        name: 'World'
      });
    });

    it('returns the props of the requested component', async () => {
      expect(responseBody.props).toEqual({
        name: 'World'
      });
    });
  });

  describe('fetching a component preview', () => {
    let response: Response;
    let responseBody: string;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${config.server.port}/preview/hello-world?name=World`);
      responseBody = await response.text();
    });

    it('renders the ragu-component', () => {
      expect(responseBody)
          .toContain(`<ragu-component src="http://localhost:${config.server.port}/components/hello-world?name=World">`);
    });
  });

  describe('fetching a component successfully with jsonp', () => {
    let response: Response;
    let responseBody: string;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${config.server.port}/components/hello-world?name=World&callback=my_callback_function`);
      responseBody = await response.text();
    });

    it('returns the html of the requested component', async () => {
      expect(responseBody).toContain('my_callback_function({');
    });

    it('returns the props excluding the callback of the requested component', async () => {
      expect(responseBody).toContain('"props":{"name":"World"}');
    });
  });

  describe('fetching assets', () => {
    it('fetches the client', async () => {
      const filename = await compiler.getClientFileName("hello-world");
      const response = await fetch(filename);
      expect(response.status).toBe(200);
    })
  });

  describe('fetching a non existing component', () => {
    let response: Response;
    let responseBody: Record<string, unknown>;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${config.server.port}/components/a-component-that-does-not-exists?name=World`);
      responseBody = await response.json();
    });

    it('returns 200 as status code', () => {
      expect(response.status).toBe(404);
    });

    it('returns an error given a not found component', async () => {
      expect(responseBody).toEqual({
        error: 'component not found',
        componentName: 'a-component-that-does-not-exists'
      });
    });
  });
});
