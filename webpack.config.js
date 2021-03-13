var path = require('path');
const srcPath     = path.resolve(__dirname, 'src');
const modulesPath = path.resolve(__dirname, 'node_modules');

module.exports = {
  module: {
    rules: [
      {
        test: /\.(vert|frag)$/i,
        use: 'raw-loader',
        include: srcPath,
        exclude: modulesPath,
      },
    ],
  },
};