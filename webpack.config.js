// @ts-check
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
  target: "webworker",
  mode: "production",
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "extension.browser.js",
    libraryTarget: "commonjs2",
  },
  plugins: [new NodePolyfillPlugin()],
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
  },
  module: {
    rules: [
      {
        test: /\.ts$/,
        exclude: /node_modules/,
        use: "ts-loader",
      },
    ],
  },
};
