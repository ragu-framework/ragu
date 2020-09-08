import getPort from "get-port";
import {ComponentsCompiler} from "./src/compiler/components-compiler";
import path from "path";
import {RaguServer} from "./src/server";

const init = async () => {
  const outputDirectory =path.join(__dirname, 'testing', 'compiled_components')

  const port = await getPort({
    port: [3000, 3001, 3002, 3003]
  });

  const config = {
    assetsPrefix: `http://localhost:${port}/component-assets/`,
    server: {
      assetsEndpoint: '/component-assets/'
    },
    components: {
      namePrefix: 'test_components_',
      output: outputDirectory,
      sourceRoot: path.join(__dirname, 'testing', 'components')
    },
    port
  };

  const compiler = new ComponentsCompiler(config);
  const server = new RaguServer(config, compiler);

  await compiler.compileAll();
  await server.start();
}

init();
