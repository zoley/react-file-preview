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
        filename: 'index.js'
    },

    devtool: 'eval-cheap-module-source-map',

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