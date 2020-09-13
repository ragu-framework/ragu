import {RaguServerConfig} from "../config";
import {getLogger} from "../logging/get-logger";
import webpack from "webpack";
import * as path from "path";

export class PreviewCompiler {
  constructor(private readonly config: RaguServerConfig) {
  }

  async compile() {
    if (this.config.server.previewEnabled) {
      getLogger(this.config).info('Compiling Ragu Preview script');

      return await new Promise<void>((resolve, reject) => {
        const webpackConfig: webpack.Configuration = {
          entry: path.join(__dirname, 'preview-ragu-client'),
          module: {
            rules: [
              {
                test: /\.tsx?$/,
                use: 'ts-loader',
                exclude: /node_modules/,
              },
            ],
          },
          resolve: {
            extensions: [ '.tsx', '.ts', '.js' ],
          },
          output: {
            filename: 'ragu-dom.js',
            path: this.config.compiler.output.browser,
          },
        };

        webpack(webpackConfig, (err, stats) => {
          if (err) {
            getLogger(this.config).error('Error during compilation', err);
            return reject(err);
          }
          if (stats.hasErrors()) {
            const statsJson = stats.toJson('minimal');
            statsJson.errors.forEach(error => {
              getLogger(this.config).error('Error during compilation', error);
            });
            return reject(stats);
          }

          resolve();
        });
      })
    }
  }
}
