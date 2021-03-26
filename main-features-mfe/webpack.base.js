const MiniCssExtractPlugin = require('mini-css-extract-plugin');


module.exports = {
  plugins: [new MiniCssExtractPlugin()],
  module: {
    rules: [
      {
        test: /\.*.tsx?$/,
        use: 'ts-loader',
        exclude: [
          /node_modules/
        ],
      },
      {
        test: /\.css$/i,
        use: [
          MiniCssExtractPlugin.loader,
          {
            loader: 'css-loader',
            options: {
              importLoaders: 1,
              modules: {
                exportLocalsConvention: "camelCase"
              },
              esModule: true,
            }
          }
        ]
      },
      {
        test: /\.(png|svg|jpg|jpeg|gif)$/i,
        use: [{
          loader: 'file-loader',
          options: {
            modules: true,
          }
        }]
      },
    ],
  },
  resolve: {
    extensions: ['.ts', '.js', '.json', ".css", ".scss"],
  }
};
