export enum LogLevel {
  debug = 0,
  info = 1,
  warn = 2,
  error = 3
}

export abstract class Logger {
  abstract log(level: LogLevel, ...value: unknown[]): void;

  debug(...values: unknown[]) {
    this.log(LogLevel.debug, ...values);
  }

  info(...values: unknown[]) {
    this.log(LogLevel.info, ...values);
  }

  warn(...values: unknown[]) {
    this.log(LogLevel.warn, ...values);
  }

  error(...values: unknown[]) {
    this.log(LogLevel.error, ...values);
  }
}
