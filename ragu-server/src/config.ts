import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";
import {ComponentResolver, createDefaultWebpackConfiguration} from "../";
import * as path from "path";
import {merge} from "webpack-merge";
const nodeExternals = require('webpack-node-externals');


export interface RaguServerBaseConfig {
  components: {
    resolver?: ComponentResolver;
    resolverOutput?: string;
    defaultDependencies?: {
      nodeRequire: string;
      dependency: string;
      globalVariable: string
    }[];
    namePrefix?: string;
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
    logging: {
      level?: LogLevel
      logger?: Logger;
    };
    port: number;
  };
  compiler: {
    watchMode?: boolean;
    assetsPrefix?: string;
    output: {
      view: string;
      hydrate: string;
    };
    webpack: {
      view: webpack.Configuration
      hydrate: webpack.Configuration
    }
  }
}

export type RaguServerConfig = RaguServerBaseConfig & {
  components: {
    namePrefix: string;
  };
  compiler: {
    assetsPrefix: string;
  }
}

export const createBaseConfig = (projectRoot = process.cwd(), isDevelopment= false): RaguServerBaseConfig => ({
  server: {
    port: 3100,
    hideWelcomeMessage: false,
    logging: {
      level: LogLevel.info
    },
    routes: {
      assets: '/component-assets/'
    },
    previewEnabled: true
  },
  compiler: {
    webpack: {
      view: merge(createDefaultWebpackConfiguration({isDevelopment}), {
        target: 'node',

        output: {
          libraryTarget: 'commonjs2',
          filename: '[name].js',
        },

        externals: nodeExternals(),
      }),
      hydrate: createDefaultWebpackConfiguration({isDevelopment}),
    },
    output: {
      view: path.join(projectRoot, '.ragu-components', 'compiled', 'view'),
      hydrate: path.join(projectRoot, '.ragu-components', 'compiled', 'hydrate')
    }
  },
  components: {
    resolverOutput: path.join(projectRoot, '.ragu-components', 'resolver-output'),
    sourceRoot: path.join(projectRoot, 'ragu-components'),
  },
});
