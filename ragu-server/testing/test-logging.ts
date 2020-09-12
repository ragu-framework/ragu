import {Logger, LogLevel} from "../src/logging/logger";

export class TestLogging extends Logger {
  stub = jest.fn();

  log(level: LogLevel, ...value: unknown[]): void {
    this.stub(level, ...value);
  }
}
