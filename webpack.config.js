const webpack = require("webpack");
const path = require("path");

let config = {
    mode: 'development',
    entry: "./assets/js/script.js",
    output: {
        path: path.resolve(__dirname, "./build"),
        filename: "./script.js"
    },
    module: {
        rules: [
            {
                test: /\.scss$/,
                use: [
                    {
                        loader: "style-loader" // creates style nodes from JS strings
                    },
                    {
                        loader: "css-loader" // translates CSS into CommonJS
                    },
                    {
                        loader: "sass-loader" // compiles Sass to CSS
                    }
                ]
            }
        ]
    }
};

module.exports = config;