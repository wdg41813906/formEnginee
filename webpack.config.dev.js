const path = require('path');
const merge = require('webpack-merge');
const baseWebpackConfig = require('./webpack.config.base');
const port = 8888;


module.exports = merge({
    mode: 'development',
    devtool: "source-map",
    devServer: {
        contentBase: path.resolve(__dirname, 'devdist'),//开发服务运行时的文件根目录
        historyApiFallback: true,//spa不跳转,history模式的路由需要true
        host: 'localhost',
        port: port,
        disableHostCheck: true,
        // hot:true,
        openPage: '#/main',
        inline: true,//实时刷新
        compress: true,//Enable gzip compression for everything served
        overlay: true, //Shows a full-screen overlay in the browser
        stats: "errors-only",//To show only errors in your bundle
        open: true, //When open is enabled, the dev server will open the browser.
    },
    module: {
        rules: [
            {
                test: /\.css$/,
                use: ["style-loader"]
            },
            {
                test: /\.less$/,
                use: ["style-loader"]
            },
            {
                test: /\.scss$/,
                use: ["style-loader"]
            }
        ]
    }
}, baseWebpackConfig);