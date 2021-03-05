import {RaguServerConfig} from "../config";
import chalk from "chalk";
import {getComponentResolver} from "../..";

export class Report {
  constructor(private readonly config: RaguServerConfig) {
  }

  async reportBuildLocation() {
    if (!this.config.showReports) {
      return;
    }

    console.log(chalk.bold.green(`📦 your build is ready!`));
    this.config.static &&
      console.log(`🚀 Deploy the ${chalk.greenBright('output path')} content and expose it at the defined ${chalk.greenBright('base url')}.`);
    console.log('');

    console.log(chalk.gray(`${chalk.bold(`Output path:`)} ${this.config.compiler.output.directory}`));
    console.log(chalk.gray(`${chalk.bold(`Base URL:`)} ${this.config.baseurl}`));
    console.log('');

    console.log(chalk.bold.magenta(`🗺 Component Routes:`));

    const allRoutes = await getComponentResolver(this.config).availableRoutes();

    for (const route of allRoutes) {
      console.log(`${chalk.gray`▸`} ${chalk.bold(route.componentName)}: ${this.config.baseurl}${route.route}`)
    }

    console.log('');
  }

  async reportPreview() {
    if (!this.config.showReports) {
      return;
    }
    console.log('')
    console.log(chalk.bold.magenta(`🔭 Preview Routes:`));

    const allRoutes = await getComponentResolver(this.config).availableRoutes();

    for (const route of allRoutes) {
      console.log(`${chalk.gray`▸`} ${chalk.bold(route.componentName)}: ${this.config.baseurl}${route.preview}`)
    }

    console.log('')
  }
}
