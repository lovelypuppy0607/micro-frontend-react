const { start2 } = require("@micro/webpack-config");
const { services } = require("@micro/configs");
const webpack = require("webpack");

const { ModuleFederationPlugin } = webpack.container;
const name = "composite";
const { scope, port, exposes } = services.configs[name];

module.exports = start2({
  port,
  publicPath: `http://localhost:${port}/`,

  plugins: (value) => [
    ...value,
    new ModuleFederationPlugin({
      name: scope,
      library: { type: "var", name: scope },
      filename: services.nameRemoteScript,
      exposes: services.convertExposes(exposes),
      remotes: {},
      shared: {},
    }),
  ],
});
