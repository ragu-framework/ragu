import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";

export interface RaguServerConfig {
  components: {
    namePrefix: string;
    sourceRoot: string;
  };
  server: {
    routes: {
      assets: string;
      component?: string;
      preview?: string;
    };
    previewEnabled?: boolean;
    hideWelcomeMessage?: boolean;
    logging?: {
      level?: LogLevel
      logger?: Logger;
    };
    port: number;
  };
  compiler: {
    watchMode?: boolean;
    assetsPrefix: string;
    output: {
      node: string;
      browser: string;
    };
    webpack?: {
      nodeConfig?: webpack.Configuration
      browserConfig?: webpack.Configuration
    }
  }
}
