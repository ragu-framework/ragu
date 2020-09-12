import {createDefaultWebpackConfiguration} from "ragu-server";

export const createWebpackConfig = (): any => {
  const configuration = createDefaultWebpackConfiguration({});

  configuration.resolve = configuration.resolve || {};
  configuration.resolve.extensions = configuration.resolve.extensions || [];
  configuration.resolve.extensions = ['.ts', '.tsx', '.js']

  return configuration;
};
