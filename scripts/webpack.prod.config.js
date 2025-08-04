const path = require('path');
const webpack = require('webpack');
const nodeExternals = require('webpack-node-externals');
const webpackConfigBase = require('./webpack.base.config');
const TerserJSPlugin = require('terser-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');
const { merge } = require('webpack-merge');

function resolve(relatedPath) {
    return path.join(__dirname, relatedPath)
}

const webpackConfigProd = {
    mode: 'production',

    entry: {
        app: [resolve('../src/components/index.js')],
    },

    output: {
        filename: 'index.js',
        path: resolve('../lib'),
        libraryTarget: 'commonjs2', // https://zhuanlan.zhihu.com/p/108216236
        chunkFilename: '[name].[contenthash:8].js', // 为动态导入的chunk设置文件名
        // umdNamedDefine:true,
        // globalObject:'this'
    },

    devtool: 'cheap-module-source-map',  //或使用'cheap-module-source-map'、'none'
    optimization: {
        minimizer: [
            // 压缩js代码
            new TerserJSPlugin({// 多进程压缩
                parallel: 4,// 开启多进程压缩
                terserOptions: {
                    compress: {
                        drop_console: true,   // 删除所有的 `console` 语句
                    },
                },
            }),
        ],
        // 代码分割配置
        splitChunks: {
            chunks: 'all',
            cacheGroups: {
                // PDF 相关依赖单独打包
                pdfjs: {
                    test: /[\\/]node_modules[\\/]pdfjs-dist[\\/]/,
                    name: 'pdfjs',
                    chunks: 'all',
                    priority: 20,
                },
                // Excel 相关依赖单独打包
                handsontable: {
                    test: /[\\/]node_modules[\\/]handsontable[\\/]/,
                    name: 'handsontable',
                    chunks: 'all',
                    priority: 20,
                },
                exceljs: {
                    test: /[\\/]node_modules[\\/]exceljs[\\/]/,
                    name: 'exceljs',
                    chunks: 'all',
                    priority: 20,
                },
                // 其他 vendor 依赖
                vendor: {
                    test: /[\\/]node_modules[\\/]/,
                    name: 'vendor',
                    chunks: 'all',
                    priority: 10,
                },
                // 默认配置
                default: {
                    minChunks: 2,
                    priority: -10,
                    reuseExistingChunk: true,
                },
            },
        },
    },
    externalsPresets: { node: true },
    externals: [nodeExternals()],

    plugins: [
        new CleanWebpackPlugin() //每次执行都将清空一下目录
    ]
}
module.exports = merge(webpackConfigBase, webpackConfigProd)

