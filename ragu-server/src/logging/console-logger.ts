import {Logger, LogLevel} from "./logger";
import chalk from "chalk";


const levelToDebug: Record<LogLevel, string> = {
  [LogLevel.debug]: chalk.greenBright`debug`,
  [LogLevel.info]: chalk.blueBright`info`,
  [LogLevel.warn]: chalk.yellowBright`warn`,
  [LogLevel.error]: chalk.redBright`error`
}

const levelToLogger: Record<LogLevel, (...values: unknown[]) => void> = {
  [LogLevel.debug]: (...values: unknown[]) => {
    console.debug(levelToDebug[LogLevel.debug], ...values);
  },
  [LogLevel.info]: (...values: unknown[]) => {
    console.info(levelToDebug[LogLevel.info], ...values);
  },
  [LogLevel.warn]: (...values: unknown[]) => {
    console.warn(levelToDebug[LogLevel.warn], ...values);
  },
  [LogLevel.error]: (...values: unknown[]) => {
    console.error(levelToDebug[LogLevel.error], ...values);
  },
}

export class ConsoleLogger extends Logger {
  static instance: ConsoleLogger;

  constructor(readonly minLevel: LogLevel = LogLevel.debug) {
    super();
  }

  log(level: LogLevel, ...value: unknown[]): void {
    if (level >= this.minLevel) {
      levelToLogger[level](...value);
    }
  }

  static getInstance(): ConsoleLogger {
    if (ConsoleLogger.instance) {
      return ConsoleLogger.instance;
    }

    ConsoleLogger.instance = new ConsoleLogger();
    ConsoleLogger.instance.info('Using the default logger. If you want to have a custom logger, define the logger at "config.logger".');
    return ConsoleLogger.instance;
  }
}
