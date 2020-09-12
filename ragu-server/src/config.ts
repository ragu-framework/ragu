import webpack from "webpack";
import {Logger} from "./logging/logger";

export interface RaguServerConfig {
  components: {
    preCompiledOutput: string;
    namePrefix: string;
    sourceRoot: string;
    output: string;
  };
  server: {
    assetsEndpoint: string
  };
  logger?: Logger;
  assetsPrefix: string;
  port: number;
  webpackConfig?: webpack.Configuration
  webpackPreCompilerConfiguration?: webpack.Configuration
}
