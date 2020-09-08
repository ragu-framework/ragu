import getPort from "get-port";
import {RaguServer} from "../src/server";
import * as path from "path";

describe('Server Side Rendering', () => {
  let port: number;
  let server: RaguServer;

  beforeAll(async () => {
    port = await getPort();
    server = new RaguServer({
      assetsPrefix: `http://localhost:${port}`,
      components: {
        namePrefix: 'test_components',
        output: path.join(__dirname, 'compiled_components'),
        sourceRoot: path.join(__dirname, 'components')
      },
      port
    });
    await server.start()
  });

  afterAll(async () => {
    await server.stop();
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

    it('returns the state of the requested component', async () => {
      expect(responseBody.state).toEqual({
        greetingType: 'Hello',
        name: 'World'
      });
    });
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
