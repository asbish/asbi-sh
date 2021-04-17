module.exports = {
  root: true,
  extends: ['standard', 'eslint:recommended'],
  env: {
    browser: true
  },
  rules: {
    semi: ['error', 'always'],
    'space-before-function-paren': 'off',
    'no-var': 'off'
  }
};
