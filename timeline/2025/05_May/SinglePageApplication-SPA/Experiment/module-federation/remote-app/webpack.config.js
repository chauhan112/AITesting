// remote-app/webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const deps = require("./package.json").dependencies;

module.exports = {
    entry: "./src/index.js", // Entry for standalone testing
    mode: "development",
    devServer: {
        port: 3001, // Important: Remote runs on a different port
        historyApiFallback: true,
    },
    output: {
        publicPath: "http://localhost:3001/", // URL from where the remote app's assets are served
    },
    resolve: {
        extensions: [".js", ".jsx"],
    },
    module: {
        rules: [
            {
                test: /\.jsx?$/,
                loader: "babel-loader",
                exclude: /node_modules/,
                options: {
                    presets: ["@babel/preset-react"],
                },
            },
        ],
    },
    plugins: [
        new ModuleFederationPlugin({
            name: "remoteApp", // Global name of the remote
            filename: "remoteEntry.js", // The manifest file
            exposes: {
                // Alias: Path to module
                "./ProfileCard": "./src/ProfileCard",
            },
            shared: {
                // Share dependencies to avoid loading them multiple times
                ...deps,
                react: { singleton: true, requiredVersion: deps.react },
                "react-dom": {
                    singleton: true,
                    requiredVersion: deps["react-dom"],
                },
            },
        }),
        new HtmlWebpackPlugin({
            template: "./public/index.html",
        }),
    ],
};
