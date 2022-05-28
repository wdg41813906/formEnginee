const merge = require('webpack-merge');
const path = require('path');
const webpack = require('webpack');
const baseWebpackConfig = require('./webpack.config.base');
const TerserPlugin = require('terser-webpack-plugin');
const MiniCssExtractPlugin = require('mini-css-extract-plugin')
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin')
//const { BundleAnalyzerPlugin } = require('webpack-bundle-analyzer');//可视化

module.exports = merge({
    mode: 'production',
    optimization: {
        minimize: true,
        minimizer: [new TerserPlugin({
            terserOptions: {
                compress: {
                    drop_console: true
                },
                output: {
                    comments: false,
                }
            },
            extractComments: false,
        })],
        splitChunks: {
            chunks: 'async',
            cacheGroups: {
                vendor: {
                    name: "vendor",
                    test: /[\\/]node_modules[\\/]/,
                    chunks: "async",
                    priority: 10
                },
                common: {
                    name: "common",
                    test: /[\\/]src[\\/]/,
                    minChunks: 1,
                    chunks: "async",
                    priority: 5,
                    reuseExistingChunk: true
                }
            }
        }
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: [
                    MiniCssExtractPlugin.loader,
                ]
            },
            {
                test: /\.less$/,
                use: [
                    MiniCssExtractPlugin.loader,
                ]
            },
            {
                test: /\.scss$/,
                use: [
                    MiniCssExtractPlugin.loader,
                ]
            }
        ]

    },
    plugins: [
        new webpack.ContextReplacementPlugin(
            /moment[\\\/]locale$/,
            /^\.\/(zh-cn)$/
        ),
        new MiniCssExtractPlugin({
            filename: 'assets/css/[name].[hash:5].css',
            // chunkFilename: "assets/css/[name].[hash:5].css",
        }),
        new OptimizeCSSAssetsPlugin({
            //开启cssnano会导致样式错误，原因未知
            //assetNameRegExp: /\.css$/g,
            //cssProcessor: require('cssnano'),
            // cssProcessorOptions: cssnanoOptions,
            // cssProcessorPluginOptions: {
            //     preset: ['default', {
            //         discardComments: {
            //             removeAll: true,
            //         },
            //         normalizeUnicode: false
            //     }]
            // },
            //canPrint: true
        }),
        //new BundleAnalyzerPlugin({ analyzerPort: 8919 })//依赖关系可视化
    ]
}, baseWebpackConfig);