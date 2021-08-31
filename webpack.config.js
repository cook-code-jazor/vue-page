const path = require('path')
const HtmlWebpackPlugin = require('html-webpack-plugin')
const CopyPlugin = require('copy-webpack-plugin')
const TerserPlugin = require('terser-webpack-plugin')

module.exports = {
  entry: './src/index.js',
  mode: 'production',
  optimization: {
    minimize: true,
    minimizer: [new TerserPlugin({
      test: /statics\/(.+?)\.js(\?.*)?$/i, // 匹配参与压缩的文件
      parallel: true, // 使用多进程并发运行
      terserOptions: { // Terser 压缩配置
        output: { comments: false }
      }
      // extractComments: false,
    })],
    splitChunks: {
      chunks: 'all',
      minSize: 20000,
      minRemainingSize: 0,
      minChunks: 1,
      maxAsyncRequests: 30,
      maxInitialRequests: 30,
      cacheGroups: {
        defaultVendors: {
          name: 'vendors',
          test: /[\\/](node_modules|vue)[\\/]/,
          priority: -10,
          reuseExistingChunk: true,
          chunks: 'initial'
        },
        default: {
          name: 'common',
          minChunks: 2,
          priority: -20,
          reuseExistingChunk: true
        }
      }
    }
  },
  module: {
    rules: [{
      test: /\.js$/,
      use: 'babel-loader',
      exclude: /node_modules|public\/vendor/
    }]
  },
  plugins: [
    new HtmlWebpackPlugin({
      publicPath: '/',
      minify: false,
      hash: true,
      inject: 'head',
      template: './public/index.html',
      filename: 'index.html',
      title: 'VuePage',
      scriptLoading: 'blocking'
    }),
    new CopyPlugin(
      {
        patterns: [
          { from: './public/web.config', to: './web.config' },
          { from: './public/vendor', to: './vendor' },
          { from: './public/views', to: './views' }
        ]
      })
  ],
  output: {
    filename: 'statics/[name].js?[hash:8]',
    path: path.resolve(__dirname, 'dist'),
    clean: true
  }
}
