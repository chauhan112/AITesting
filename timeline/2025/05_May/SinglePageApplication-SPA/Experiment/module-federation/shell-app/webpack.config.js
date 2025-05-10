// shell-app/webpack.config.js
const HtmlWebpackPlugin = require("html-webpack-plugin");
const { ModuleFederationPlugin } = require("webpack").container;
const path = require("path");
const deps = require("./package.json").dependencies;

module.exports = {
    entry: "./src/index.js",
    mode: "development",
    devServer: {
        port: 3000, // Shell runs on port 3000
        historyApiFallback: true,
    },
    output: {
        publicPath: "auto", // Or 'http://localhost:3000/'
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
            name: "shellApp",
            remotes: {
                // Alias: 'name_of_remote@URL_to_remoteEntry.js'
                remoteApp: "remoteApp@http://localhost:3001/remoteEntry.js",
            },
            shared: {
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
