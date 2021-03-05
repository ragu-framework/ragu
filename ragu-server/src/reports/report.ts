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

    console.log(chalk.bold(`📦 your build is ready!`));

    this.config.static &&
      console.log(`🚀 You should deploy the ${chalk.greenBright('output path')} content at the defined ${chalk.greenBright('base URL')}.`);

    console.log(`${chalk.bold(`Output path:`)} ${this.config.compiler.output.directory}`);
    console.log(`${chalk.bold(`Base URL:`)} ${this.config.baseurl}`);
    console.log(chalk.bold(`Routes`));

    const allRoutes = await getComponentResolver(this.config).availableRoutes();

    for (const route of allRoutes) {
      console.log(`${this.config.baseurl}${route.route}`)
    }
  }

  async reportPreview() {
    if (!this.config.showReports) {
      return;
    }
    console.log(chalk.bold(`Preview Routes`));

    const allRoutes = await getComponentResolver(this.config).availableRoutes();

    for (const route of allRoutes) {
      console.log(`▸ ${this.config.baseurl}${route.preview}`)
    }
  }
}
