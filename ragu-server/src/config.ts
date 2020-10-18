import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";
import {ComponentResolver, createDefaultWebpackConfiguration} from "../";
import * as path from "path";
import {merge} from "webpack-merge";
import deepmerge from "deepmerge";
import {isPlainObject} from "is-plain-object";

const nodeExternals = require('webpack-node-externals');


export interface RaguServerBaseConfig {
  projectRoot?: string,
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

type WithNoDefaultConfig = {
  components: {
    namePrefix: string;
  };
  compiler: {
    assetsPrefix: string;
  }
};

export type RaguServerConfig = RaguServerBaseConfig & WithNoDefaultConfig

type DeepPartial<T> = {
  [P in keyof T]?: DeepPartial<T[P]>
}

export type RaguServerBaseConfigProps = DeepPartial<RaguServerConfig> & WithNoDefaultConfig;

export const mergeConfig = <T1, T2>(a: T1, b: T2) => deepmerge<T1, T2>(a, b, {
  isMergeableObject: isPlainObject
});

export const createConfig = (props: RaguServerBaseConfigProps): RaguServerConfig => {
  const projectRoot = props.projectRoot || process.cwd();

  const config = mergeConfig<RaguServerBaseConfig, RaguServerBaseConfigProps>({
    environment: 'production',
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
        view: path.join(projectRoot, '.ragu-components', 'compiled', 'view'),
        hydrate: path.join(projectRoot, '.ragu-components', 'compiled', 'hydrate')
      }
    },
    components: {
      resolverOutput: path.join(projectRoot, '.ragu-components', 'resolver-output'),
      sourceRoot: path.join(projectRoot, 'ragu-components'),
    },
  }, props);

  if (props.compiler.webpack?.view) {
    config.compiler.webpack.view = props.compiler.webpack.view as webpack.Configuration;
  }

  if (props.compiler.webpack?.hydrate) {
    config.compiler.webpack.hydrate = props.compiler.webpack.hydrate as webpack.Configuration;
  }

  return config;
};
