import {RaguServerConfig} from "../config";
import {Logger} from "./logger";
import {ConsoleLogger} from "./console-logger";

export const getLogger = (config: RaguServerConfig): Logger => {
  if (config.logger) {
    return config.logger
  }

  return ConsoleLogger.getInstance();
}
