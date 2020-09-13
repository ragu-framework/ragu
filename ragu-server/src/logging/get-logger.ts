import {RaguServerConfig} from "../config";
import {Logger} from "./logger";
import {ConsoleLogger} from "./console-logger";

export const getLogger = (config: RaguServerConfig): Logger => {
  if (config.server.logging?.logger) {
    return config.server.logging.logger
  }

  return ConsoleLogger.getInstance(config);
}
