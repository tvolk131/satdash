import * as path from 'path';
import * as webpack from 'webpack';
const SRC_DIR = path.join(__dirname, '/src');
const DIST_DIR = path.join(__dirname, '/out');
const ForkTsCheckerWebpackPlugin = require('fork-ts-checker-webpack-plugin');
// const BundleAnalyzerPlugin = require('webpack-bundle-analyzer').BundleAnalyzerPlugin;

export default (_: any, {watch, mode}: {watch?: boolean, mode?: string}): webpack.Configuration => {
  const maxBundleSize = mode === 'production' ? 910000 : 5400000;

  return {
    entry: `${SRC_DIR}/index.tsx`,
    output: {
      filename: 'bundle.js',
      path: DIST_DIR
    },
    module: {
      rules: [
        {
          test: /\.tsx?$/,
          use: {
            loader: 'ts-loader',
            options: {
              transpileOnly: true
            }
          }
        }
      ]
    },
    resolve: {
      extensions: ['.js', '.jsx', '.ts', '.tsx', '.json']
    },
    plugins: [
      new ForkTsCheckerWebpackPlugin()
      // new BundleAnalyzerPlugin() // Uncomment for bundle analysis
    ],
    performance: {
      maxAssetSize: maxBundleSize,
      maxEntrypointSize: maxBundleSize,
      hints: 'error'
    }
  };
};