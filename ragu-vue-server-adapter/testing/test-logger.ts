import {LogLevel, Logger} from "ragu-server";

export class TestLogger extends Logger {
  stub = jest.fn();

  log(level: LogLevel, ...value: unknown[]): void {
    this.stub(level, ...value);
  }
}
