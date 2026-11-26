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
    },
    externalsPresets: { node: true },
    // 先打包 Markdown 及缓存依赖，避免旧版消费端 Webpack 错误优化其压缩源码。
    externals: [nodeExternals({ allowlist: [/^md-editor-rt(?:\/|$)/, /^lru-cache(?:\/|$)/] })],

    plugins: [
        new CleanWebpackPlugin() //每次执行都将清空一下目录
    ]
}
module.exports = merge(webpackConfigBase, webpackConfigProd)

