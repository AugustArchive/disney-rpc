const { optimize } = require('webpack');
const { join } = require('path');

const prodPlugins = [];
if (process.env.NODE_ENV === 'production') prodPlugins.push(new optimize.AggressiveMergingPlugin(), new optimize.OccurrenceOrderPlugin());

/**
 * Webpack configuration
 * @type {import('webpack').Configuration}
 */
module.exports = {
  mode: process.env.NODE_ENV,
  devtool: 'inline-source-map',
  plugins: [],
  entry: {
    contentscript: join(__dirname, 'src/ContentScript.ts'),
    background: join(__dirname, 'src/BackgroundTask.ts')
  },
  output: {
    filename: '[name].js',
    path: join(__dirname, 'build')
  },
  module: {
    rules: [
      {
        test: /\.s[ac]ss$/i,
        use: ['sass-loader']
      },
      {
        exclude: /node_modules/,
        test: /\.ts?$/,
        use: 'ts-loader'
      }
    ]
  },
  resolve: {
    extensions: ['.ts', '.js']
  },
  plugins: [...prodPlugins]
};