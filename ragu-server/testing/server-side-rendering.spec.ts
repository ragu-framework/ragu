import getPort from "get-port";
import {RaguServer} from "../src/server";
import * as path from "path";
import {ComponentsCompiler} from "../src/compiler/components-compiler";
import {emptyDir} from "fs-extra";
import {TestLogging} from "./test-logging";

describe('Server Side Rendering', () => {
  let port: number;
  let server: RaguServer;
  let compiler: ComponentsCompiler;
  const outputDirectory = path.join(__dirname, 'compiled_components');
  const preCompiledOutput = path.join(__dirname, 'pre_compiled_components');

  beforeAll(async () => {
    port = await getPort();

    const config = {
      assetsPrefix: `http://localhost:${port}/component-assets/`,
      server: {
        assetsEndpoint: '/component-assets/'
      },
      logger: new TestLogging(),
      components: {
        preCompiledOutput,
        namePrefix: 'test_components_',
        output: outputDirectory,
        sourceRoot: path.join(__dirname, 'components'),
      },
      port
    };

    compiler = new ComponentsCompiler(config);
    server = new RaguServer(config, compiler);

    await compiler.compileAll();
    await server.start()
  });

  afterAll(async () => {
    await server.stop();
    await emptyDir(outputDirectory);
  });

  describe('fetching a component successfully', () => {
    let response: Response;
    let responseBody: Record<string, unknown>;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${port}/components/hello-world?name=World`);
      responseBody = await response.json();
    });

    it('returns 200 as status code', () => {
      expect(response.status).toBe(200);
    });

    it('returns the html of the requested component', async () => {
      expect(responseBody.html).toBe('<b>Hello, World</b>');
    });

    it('returns the html of the requested component', async () => {
      expect(responseBody.dependencies).toEqual([{
        'nodeRequire': 'react',
        'globalVariable': 'React',
        'dependency': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }]);
    });

    it('returns the client file name', async () => {
      const filename = await compiler.getClientFileName();
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

  describe('fetching a component successfully with jsonp', () => {
    let response: Response;
    let responseBody: string;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${port}/components/hello-world?name=World&callback=my_callback_function`);
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
      const filename = await compiler.getClientFileName();
      const response = await fetch(filename);
      expect(response.status).toBe(200);
    })
  });

  describe('fetching a non existing component', () => {
    let response: Response;
    let responseBody: Record<string, unknown>;

    beforeAll(async () => {
      response = await fetch(`http://localhost:${port}/components/a-component-that-does-not-exists?name=World`);
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
