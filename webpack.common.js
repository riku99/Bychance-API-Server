const path = require("path");
const CopyPlugin = require("copy-webpack-plugin");
const nodeExternals = require("webpack-node-externals");

module.exports = {
  target: "node",
  entry: "./src/index.ts",
  module: {
    rules: [
      {
        test: /\.ts$/,
        loader: "ts-loader",
        options: {
          configFile: "webpack.tsconfig.json", // ビルドの時はtsconfig.jsonとは異なる設定を使いたいのでconfigFileで指定
        },
        exclude: /node_modules/,
      },
    ],
  },
  resolve: {
    extensions: [".ts", ".js"],
    alias: {
      "~": path.resolve(__dirname, "./src"), // tsの設定で ~ をエイリアスとしてモジュール解決できるようになっているのでwebpack側でも同じように解決させる必要がある。 https://stackoverflow.com/questions/58990192/webpack-module-not-found-error-cant-resolve-pt
    },
  },
  output: {
    path: path.resolve(__dirname, "dist"),
    filename: "bundle.js",
  },
  externals: [nodeExternals()], // node_modulesを依存関係に持たせるために必要
  plugins: [
    new CopyPlugin({
      patterns: [{ from: "./prisma/schema.prisma" }],
    }),
  ],
};
