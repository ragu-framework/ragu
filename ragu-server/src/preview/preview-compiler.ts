import {RaguServerConfig} from "../config";
import {getLogger} from "../logging/get-logger";
import webpack from "webpack";
import * as path from "path";

export class PreviewCompiler {
  constructor(private readonly config: RaguServerConfig) {
  }

  async compile() {
    if (this.config.isPreviewEnabled) {
      getLogger(this.config).info('Compiling Ragu Preview script');

      return await new Promise<void>((resolve, reject) => {
        webpack({
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
            path: this.config.components.output,
          },
        }, (err, stats) => {
          if (err) {
            console.log(err);
            return reject(err);
          }
          if (stats.hasErrors()) {
            const statsJson = stats.toJson('minimal');
            statsJson.errors.forEach(error => console.error(error));
            return reject(stats);
          }

          resolve();
        });
      })
    }
  }
}
