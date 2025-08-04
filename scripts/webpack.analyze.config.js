const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');
const webpackConfigProd = require('./webpack.prod.config');

module.exports = {
  ...webpackConfigProd,
  plugins: [
    ...webpackConfigProd.plugins,
    new BundleAnalyzerPlugin({
      analyzerMode: 'static',
      openAnalyzer: true,
      reportFilename: '../bundle-report.html',
    }),
  ],
};