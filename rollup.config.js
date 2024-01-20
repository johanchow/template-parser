const resolve = require('@rollup/plugin-node-resolve');
const commonjs = require('@rollup/plugin-commonjs');
const typescript = require('@rollup/plugin-typescript');
const babel = require('@rollup/plugin-babel');
const json = require('@rollup/plugin-json');

const sharedConfig = {
  input: 'src/index.ts',
  external: [],
  plugins: [
    json(),
    resolve(),
    commonjs(),
    typescript(),
    babel({ babelHelpers: 'bundled', exclude: 'node_modules/**', extensions: ['.js', '.jsx', '.ts', '.tsx'] })
  ]
};

const esmConfig = {
  ...sharedConfig,
  output: {
    file: 'es/index.js',
    format: 'esm',
  }
};

const cjsConfig = {
  ...sharedConfig,
  output: {
    file: 'lib/index.js',
    format: 'cjs',
  }
};

module.exports = [esmConfig, cjsConfig];
