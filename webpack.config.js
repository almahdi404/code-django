// @ts-check
const path = require("path");
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin");

/** @type {import('webpack').Configuration} */
module.exports = {
  target: "webworker",
  entry: "./src/extension.ts",
  output: {
    path: path.resolve(__dirname, "out"),
    filename: "extension.browser.js",
    libraryTarget: "commonjs",
  },
  plugins: [new NodePolyfillPlugin()],
  externals: {
    vscode: "commonjs vscode",
  },
  resolve: {
    extensions: [".ts", ".js"],
    fallback: { path: require.resolve("path-browserify") },
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
