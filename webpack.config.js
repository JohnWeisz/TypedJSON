const path = require('path');
const UglifyJsPlugin = require('uglifyjs-webpack-plugin');

module.exports = {
  entry: {
    'typedjson': './src/typedjson.ts',
    'typedjson.min': './src/typedjson.ts',
  },
  devtool: 'source-map',
  module: {
    rules: [
      {
        test: /\.[jt]s$/,
        use: 'ts-loader',
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [ '.ts', '.js' ],
  },
  output: {
    filename: '[name].js',
    path: path.resolve(__dirname, 'js'),
    library: 'typedjson',
    libraryTarget: 'umd',
    umdNamedDefine: true,
  },
  optimization: {
    minimizer: [
      new UglifyJsPlugin({
        include: /\.min\.js$/,
        sourceMap: true,
      })
    ],
  },
  mode: "production",
};
