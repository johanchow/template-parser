module.exports = {
  root: true,
  parser: '@typescript-eslint/parser',
  extends: [
    'airbnb',
    'airbnb-typescript/base',
    'plugin:jest/recommended',
  ],
  plugins: [
    '@typescript-eslint',
    'jest',
  ],
  parserOptions: {
    project: './tsconfig.json'
  },
  env: {
    node: true,
    jest: true,
  },
  rules: {
  },
};
