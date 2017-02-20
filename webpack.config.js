var path = require('path');
var fs = require('fs');

var nodeModules = {};
fs.readdirSync('node_modules')
  .filter(function (x) {
    return ['.bin'].indexOf(x) === -1;
  })
  .forEach(function (mod) {
    nodeModules[mod] = 'commonjs ' + mod;
  });

module.exports = {
  target: 'node',
  entry: [
    './src/main.ts'
  ],
  output: {
    filename: '/fuzzer.js',
    path: './dist'
  },
  externals: nodeModules,
  module: {
    rules: [{
      test: /\.tsx?$/,
      loader: 'ts-loader',
      exclude: /node_modules/,
    }, ]
  },
  resolve: {
    extensions: [".tsx", ".ts", ".js"]
  },

}