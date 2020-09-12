import {ConsoleLogger} from "../src/logging/console-logger";
import chalk from "chalk";

describe('Console Logger', () => {
  it('calls console debug with a green color when debug', () => {
    const mock = jest.spyOn(console, 'debug').mockImplementation(() => {});
    new ConsoleLogger().debug('Hi');

    expect(mock).toBeCalledWith(chalk.greenBright`debug`, 'Hi');
  });

  it('calls console info with a blue color when debug', () => {
    const mock = jest.spyOn(console, 'info').mockImplementation(() => {});
    new ConsoleLogger().info('Hi');

    expect(mock).toBeCalledWith(chalk.blueBright`info`, 'Hi');
  });

  it('calls console warn with a yellow color when warn', () => {
    const mock = jest.spyOn(console, 'warn').mockImplementation(() => {});
    new ConsoleLogger().warn('Hi');

    expect(mock).toBeCalledWith(chalk.yellowBright`warn`, 'Hi');
  });

  it('calls console error with a yellow color when error', () => {
    const mock = jest.spyOn(console, 'error').mockImplementation(() => {});
    new ConsoleLogger().error('Hi');

    expect(mock).toBeCalledWith(chalk.redBright`error`, 'Hi');
  });
});
