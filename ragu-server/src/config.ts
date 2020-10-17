import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";
import {ComponentResolver, createDefaultWebpackConfiguration} from "../";
import * as path from "path";
import {merge} from "webpack-merge";
import deepmerge from "deepmerge";
import {isPlainObject} from "is-plain-object";
const nodeExternals = require('webpack-node-externals');


export interface RaguServerBaseConfig {
  environment?: 'production' | 'development',
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

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type RaguServerBaseConfigProps = DeepPartial<RaguServerConfig> & {
  projectRoot: string,
  environment: 'production' | 'development',
  components: {
    namePrefix: string;
  },
  compiler: {
    assetsPrefix: string;
  }
}


export const createConfig = (props: RaguServerBaseConfigProps): RaguServerConfig => deepmerge({
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
      view: merge(createDefaultWebpackConfiguration({isDevelopment: props.environment === 'development'}), {
        target: 'node',
        output: {
          libraryTarget: 'commonjs2',
          filename: '[name].js',
        },
        externals: [
          nodeExternals()
        ],
      }),
      hydrate: createDefaultWebpackConfiguration({isDevelopment: props.environment === 'development'}),
    },
    output: {
      view: path.join(props.projectRoot, '.ragu-components', 'compiled', 'view'),
      hydrate: path.join(props.projectRoot, '.ragu-components', 'compiled', 'hydrate')
    }
  },
  components: {
    resolverOutput: path.join(props.projectRoot, '.ragu-components', 'resolver-output'),
    sourceRoot: path.join(props.projectRoot, 'ragu-components'),
  },
}, props, {
  isMergeableObject: isPlainObject
});
