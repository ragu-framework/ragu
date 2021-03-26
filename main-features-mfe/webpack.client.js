module.exports = {
  ...require('./webpack.base'),
  output: {
    filename: '[contenthash].bundle.js',
  }
};
