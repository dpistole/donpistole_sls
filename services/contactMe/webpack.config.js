const path = require('path');

module.exports = {
  target: 'node',
  entry: './src/index.js',
  output: {
    path: path.resolve(__dirname, 'dist'),
    filename: 'bundle.js',
    libraryTarget: 'umd',
  },
  externals: {
    'aws-sdk': 'aws-sdk'
  },
  module: {
    rules: [
      {
        test: /\.js$/,
        exclude: /(node_modules)/,
        use: {
          loader: 'babel-loader',
          options: {
            presets: [
              [
                '@babel/preset-env',
                {
                  targets: {
                    node: "current",
                  },
                }
              ]
            ],
            plugins: ["@babel/plugin-transform-runtime"],
          }
        }
      }
    ]
  }
};
