const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const CopyPlugin = require("copy-webpack-plugin");
const TerserPlugin = require('terser-webpack-plugin');

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
        test: /core\/(.+?)\.js(\?.*)?$/i,    //匹配参与压缩的文件
        parallel: true,    //使用多进程并发运行
        terserOptions: {    //Terser 压缩配置
            output:{comments: false}
        },
        extractComments: false,
    })],
},
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