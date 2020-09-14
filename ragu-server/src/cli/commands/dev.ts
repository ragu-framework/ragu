import {ComponentsCompiler, RaguServer, RaguServerConfig} from "../../..";

export const dev = async (config: RaguServerConfig) => {
  config.compiler.watchMode = true;

  const compiler = new ComponentsCompiler(config);
  const server = new RaguServer(config, compiler);

  await compiler.compileAll();
  await server.start();
}
