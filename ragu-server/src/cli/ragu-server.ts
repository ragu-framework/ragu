#!/usr/bin/env node
import yargs from "yargs";
import * as path from "path";
import {ConsoleLogger} from "../logging/console-logger";
import {runServer} from "./commands/run-server";
import {init} from "./commands/init";
import {dev} from "./commands/dev";
import {build} from "./commands/build";

function getAbsolutePath(file: string) {
  if (!path.isAbsolute(file)) {
    return path.join(process.cwd(), file)
  }
  return file;
}

function requireInput(configFile: string) {
  let fullPathRequire = getAbsolutePath(configFile);

  return require(fullPathRequire) || require(fullPathRequire).default;
}

yargs
    .scriptName("ragu-server")
    .usage('$0 <cmd> [args]')
    .command('run [configFile]', 'Starts the ragu server with the given configuration', (yargs) => {
      yargs.positional('configFile', {
        type: 'string',
        default: path.join(process.cwd(), 'ragu-config.js'),
        describe: 'the name to say hello to'
      });
    }, (argv) => {
      const consoleLogger = new ConsoleLogger();

      try {
        const config = requireInput(argv.configFile as string);
        runServer(config).catch((e) => {
          consoleLogger.error('process finished with an error:', e);
          process.exit(1);
        });
      } catch (e) {
        consoleLogger.error(`Can't open config file:`, e);
      }
    })
    .command('dev [configFile]', 'Starts the ragu dev server with the given configuration', (yargs) => {
      yargs.positional('configFile', {
        type: 'string',
        default: path.join(process.cwd(), 'ragu-config.js'),
      });
    }, (argv) => {
      const consoleLogger = new ConsoleLogger();

      try {
        const config = requireInput(argv.configFile as string);
        dev(config).catch((e) => {
          consoleLogger.error('process finished with an error:', e);
          process.exit(1);
        });
      } catch (e) {
        consoleLogger.error(`Can't open config file:`, e);
      }
    })
    .command('build [configFile]', 'builds the project', (yargs) => {
      yargs.positional('configFile', {
        type: 'string',
        default: path.join(process.cwd(), 'ragu-config.js'),
      });
    }, (argv) => {
      const consoleLogger = new ConsoleLogger();

      try {
        const config = requireInput(argv.configFile as string);
        build(config).catch((e) => {
          consoleLogger.error('process finished with an error:', e);
          process.exit(1);
        });
      } catch (e) {
        consoleLogger.error(`Can't open config file:`, e);
      }
    })
    .command('init [projectName]', 'creates a project with the given name', (yargs) => {
      yargs.positional('projectName', {
        type: 'string',
      });
    }, (argv) => {
      init(argv.projectName as string);
    })
    .help()
    .argv
