import {createTestConfig} from "../test-config-factory";
import {ComponentsCompiler, RaguServerConfig} from "../../index";
import {emptyDirSync} from "fs-extra";
import path from 'path';

describe('StaticService', () => {
  let config: RaguServerConfig;

  beforeAll(async () => {
    config = await createTestConfig();
  })

  afterAll(() => {
    emptyDirSync(config.compiler.output.serverSide);
    emptyDirSync(config.compiler.output.clientSide);
  });

  it('creates a json file with the component name', async () => {
    config.static = true;

    const compiler = new ComponentsCompiler(config);
    await compiler.compileAll();

    const helloWorld = require(path.resolve(config.compiler.output.directory, 'hello-world.json'));

    expect(helloWorld.client).toMatch('file://');
    expect(helloWorld.props).toBeUndefined();
  });
})
