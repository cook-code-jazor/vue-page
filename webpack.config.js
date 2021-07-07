const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  plugins: [
    new HtmlWebpackPlugin({
      publicPath: './public/',
      minify: false,
      hash: false,
      inject: false,
      template: './public/index.html',
      filename: 'index.html',
      title: 'VuePage',
    }),
    new CopyPlugin({patterns : [
        { from: "./public/", to: "./" , transform: (content) => content },
      ]}),
  ],
  output: {
    filename: 'core/vue-page.js',
    path: path.resolve(__dirname, 'dist'),
    clean: true,
  },
};