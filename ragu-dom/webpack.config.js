const path = require('path');

module.exports = {
  mode: 'production',
  entry: './index.ts',
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
    libraryTarget: 'var',
    library: 'RaguDOM',
    filename: 'ragu-dom.js',
    path: path.resolve(__dirname, 'dist'),
  },
};
