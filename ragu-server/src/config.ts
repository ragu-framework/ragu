import webpack from "webpack";
import {Logger, LogLevel} from "./logging/logger";
import {ComponentResolver, createDefaultWebpackConfiguration} from "../";
import * as path from "path";
import {merge} from "webpack-merge";
import deepmerge from "deepmerge";
import {isPlainObject} from "is-plain-object";

const nodeExternals = require('webpack-node-externals');


type GlobalDependency = {
  /**
   * The package name.
   *
   * for `require('react')` you must specify 'react' as `nodeRequire`.
   */
  nodeRequire: string;
  /**
   * A CDN URL which will be fetched in order to load this component.
   */
  dependency: string;
  /**
   * The global variable that the CDN exports.
   *
   * @example for react the default varialble is `React`.
   */
  globalVariable: string
};

/**
 * The ragu configuration object
 */
export interface RaguServerBaseConfig {
  /**
   * The project root directory.
   *
   * @default the current working directory `process.cwd()`
   */
  projectRoot?: string,
  /**
   * Describe if the project is running either on 'production' or 'development' environment.
   */
  environment?: 'production' | 'development',
  /**
   * A set of configuration for ragu components.
   */
  components: {
    /**
     * The resolver specifies how components will be resolved.
     *
     * @default ByFileStructureComponentResolver
     */
    resolver?: ComponentResolver;
    /**
     * A ComponentResolver may result in auto-generated code. This property describe where the code should be generated.
     *
     * @default `projectRoot`/.ragu-components/resolver-output
     */
    resolverOutput?: string;
    /**
     * List of dependencies which should not be incorporated at the component bundle. It is useful to avoid to have
     * the same dependency at multiple micro-frontends.
     */
    defaultDependencies?: GlobalDependency[];
    /**
     * This required property aims to avoid namespace collision between micro-frontends.
     */
    namePrefix?: string;
    /**
     * Describes where your ragu-components live.
     *
     * @default `projectRoot`/ragu-components/
     */
    sourceRoot: string;
  };
  /**
   * A set of configuration of ragu-server.
   */
  server: {
    routes: {
      /**
       * The route where ragu-server should expose the project assets.
       *
       * If you change this property you may need to change the `config.compiler.assetsPrefix`.
       *
       * @default `component-assets`
       */
      assets: string;
      /**
       * The route where ragu-server should expose the micro-frontends.
       *
       * @example http://host/components/component-name
       *
       * @default `/components`/
       */
      component?: string;
      /**
       * The route where ragu-server should expose the micro-frontends preview.
       *
       * @example http://host/preview/component-name
       *
       * @default `/preview`/
       */
      preview?: string;
    };
    /**
     * Define if ragu-server should expose the preview route.
     *
     * @default true
     */
    previewEnabled?: boolean;
    /**
     * Define if ragu-server print the welcome message when server starts.
     *
     * @default false
     */
    hideWelcomeMessage?: boolean;
    logging: {
      /**
       * The minimum level to print.
       *
       * @default LogLevel.info
       */
      level?: LogLevel
      /**
       * Define a custom logger.
       *
       * @default ConsoleLogger
       */
      logger?: Logger;
    };
    /**
     * The port where ragu-server should start.
     *
     * @default 3100
     */
    port: number;
  };
  compiler: {
    /**
     * Define if ragu server should auto-recompile the project when components change.
     *
     * @default `true` when `ragu-server dev` and `false` for `ragu-server start`.
     */
    watchMode?: boolean;
    /**
     * You must specify the the base url where the components assets will be exposed.
     *
     * @example http://localhost:3100/component-assets/
     *
     * The `/component-assets/` must be the same of `config.server.routes.assets`
     */
    assetsPrefix?: string;
    output: {
      /**
       * Describe where view compiled files should be outputted.
       *
       * @default `projectRoot`/.ragu-components/output/view/
       */
      view: string;
      /**
       * Describe where hydrate compiled files should be outputted.
       *
       * @default `projectRoot`/.ragu-components/output/hydrate/
       */
      hydrate: string;
    };
    webpack: {
      /**
       * The webpack configuration for view (aka server-side components)
       */
      view: webpack.Configuration
      /**
       * The webpack configuration for hydrate (aka client-side components)
       */
      hydrate: webpack.Configuration
    }
  }
}

/**
 * The ser of properties which must be defined in order to ragu-server work.
 */
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

/**
 * Creates a ragu-server config.
 * You also can override any default config by given it at the `props` object.
 * It uses a deepmerge algorithm to merge the configurations.
 *
 * @param props The config with no default values plus any extra configuration that you may need to override.
 */
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
