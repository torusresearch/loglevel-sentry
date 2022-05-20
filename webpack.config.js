/* eslint-disable @typescript-eslint/no-var-requires */

const pkg = require("./package.json");

const pkgName = "loglevelSentry";

exports.baseConfig = {};

exports.nodeConfig = {
  optimization: {
    minimize: false,
  },
  output: {
    filename: `${pkgName}-node.js`,
    library: {
      type: "commonjs2",
    },
  },
  externals: [...Object.keys(pkg.dependencies), /^(@babel\/runtime)/i],
  target: "node",
};

// v5
// experiments: {
//   outputModule: true
// }

// node: {
//   global: true,
// },
// resolve: {
//   alias: { crypto: 'crypto-browserify', stream: 'stream-browserify', vm: 'vm-browserify' },
//   aliasFields: ['browser'],
// },
