import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";
import {ComponentResolver} from "../";

export interface RaguServerConfig {
  components: {
    resolver?: ComponentResolver;
    resolverOutput?: string;
    defaultDependencies?: {
      nodeRequire: string;
      dependency: string;
      globalVariable: string
    }[];
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
      view: string;
      hydrate: string;
    };
    webpack?: {
      view?: webpack.Configuration
      hydrate?: webpack.Configuration
    }
  }
}
