import {ComponentsCompiler, RaguServerConfig} from "../../..";

export const build = async (config: RaguServerConfig) => {
  const compiler = new ComponentsCompiler(config);
  await compiler.compileAll();
}
