const path = require('path');
const webpack = require('webpack');
const webpackConfigBase = require('./webpack.base.config');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const { merge } = require('webpack-merge');

function resolve(relatedPath) {
    return path.join(__dirname, relatedPath)
}

const webpackConfigDev = {
    mode: 'development',

    entry: {
        app: [resolve('../src/index.js')],
    },

    output: {
        path: resolve('../dist'),
        filename: 'index.js',
        chunkFilename: '[name].chunk.js', // 开发环境的chunk文件名
    },

    devtool: 'eval-source-map',
    // devtool: 'eval-cheap-module-source-map',

    // 开发环境代码分割配置
    optimization: {
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // PDF 相关依赖单独打包
                pdfjs: {
                    test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
                    name: 'pdfjs',
                    chunks: 'all',
                },
                // Excel 相关依赖单独打包
                handsontable: {
                    test: /[\\/]node_modules[\\/]handsontable[\\/]/,
                    name: 'handsontable',
                    chunks: 'all',
                },
                exceljs: {
                    test: /[\\/]node_modules[\\/]exceljs[\\/]/,
                    name: 'exceljs',
                    chunks: 'all',
                },
                // 其他vendor依赖
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 10,
                },
            },
        },
    },

    devServer: {
        hot: true,
        open: true,
        host: '0.0.0.0',
        port: 9527
    },

    plugins: [
        new HtmlWebpackPlugin({ template: './public/index.html', }),
    ]
}

module.exports = merge(webpackConfigBase, webpackConfigDev)