import * as path from "path";
import {ComponentsCompiler} from "../src/compiler/components-compiler";
import * as fs from "fs";
import * as jsdom from "jsdom";
import {ConstructorOptions} from "jsdom";

describe('Server Side Rendering', () => {
  let port: number = 8080;
  let compiler: ComponentsCompiler;
  let dom: jsdom.JSDOM;
  const outputDirectory = path.join(__dirname, 'compiled_components');

  beforeAll(async () => {
    compiler = new ComponentsCompiler({
      assetsPrefix: `file://${outputDirectory}/`,
      components: {
        namePrefix: 'test_components_',
        output: outputDirectory,
        sourceRoot: path.join(__dirname, 'components')
      },
      port
    });

    await compiler.compileAll();
  });

  beforeEach(() => {
    const options: ConstructorOptions = {
      url: `file://${outputDirectory}`,
      resources: 'usable',
      runScripts: 'dangerously',
    }
    dom = new jsdom.JSDOM(undefined, options);

    (global as any).window = dom.window;
    (global as any).document = dom.window.document;
  })

  function evalCompiledClient() {
    const clientFileName = compiler.getClientFileName();

    const client = fs.readFileSync(path.join(outputDirectory, clientFileName)).toString();
    eval(client);
  }

  it('exports compiled component into window', async () => {
    evalCompiledClient();

    const resolvedComponent = await (window as any)['test_components_hello-world'].resolve();
    const div = dom.window.document.createElement('div');
    resolvedComponent.render({name: 'World'}, div);

    expect(div.textContent).toContain('Hello, World');
  });

  it('exports all dependencies without load the module', async () => {
    evalCompiledClient();

    const dependencies = (window as any)['test_components_hello-world'].dependencies;

    expect(dependencies).toEqual([
      {
        'require': 'react',
        'replaceWith': 'React',
        'from': 'https://unpkg.com/react@16/umd/react.production.min.js'
      }
    ]);
  });
});
