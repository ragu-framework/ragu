import {ComponentsCompiler, RaguServer, RaguServerConfig} from "../../..";

export const runServer = async (config: RaguServerConfig) => {
  const compiler = new ComponentsCompiler(config);
  const server = new RaguServer(config, compiler);

  await compiler.compileAll();
  await server.start();
}
