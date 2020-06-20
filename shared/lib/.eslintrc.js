module.exports = {
  root: true,
  plugins: ['es5'],
  extends: ['standard', 'eslint:recommended', 'plugin:es5/no-es2015'],
  env: {
    browser: true
  },
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': 'off'
  }
};
