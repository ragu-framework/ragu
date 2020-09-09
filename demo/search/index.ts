import path = require("path");
import {ComponentsCompiler} from "../../ragu-server/src/compiler/components-compiler";
import {RaguServer} from "../../ragu-server/src/server";

const init = async () => {
  const port = 3200;

  const config = {
    assetsPrefix: `http://localhost:${port}/component-assets/`,
    server: {
      assetsEndpoint: '/component-assets/'
    },
    components: {
      namePrefix: 'search',
      output: path.join(__dirname, 'compiled_components'),
      sourceRoot: path.join(__dirname, 'components')
    },
    port
  };

  const compiler = new ComponentsCompiler(config);
  const server = new RaguServer(config, compiler);

  await compiler.compileAll();
  await server.start();
}

init();
