import {Logger, LogLevel} from "../src/logging/logger";

export class TestLogger extends Logger {
  stub = jest.fn();

  log(level: LogLevel, ...value: unknown[]): void {
    this.stub(level, ...value);
  }
}
