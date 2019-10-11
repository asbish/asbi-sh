module.exports = {
  plugins: ['@typescript-eslint', 'jsx-a11y', 'react'],
  extends: [
    'standard',
    'eslint:recommended',
    'plugin:@typescript-eslint/recommended',
    'plugin:react/recommended',
    'plugin:jsx-a11y/recommended',
    'prettier',
    'prettier/@typescript-eslint'
  ],
  parserOptions: {
    parser: '@typescript-eslint/parser'
  },
  settings: {
    react: {
      pragma: 'h',
      version: '16'
    }
  },
  env: {
    browser: true
  },
  rules: {
    'no-console': 'warn',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-member-accessibility': [
      'error',
      { accessibility: 'no-public' }
    ]
  },
  overrides: [
    {
      files: ['*.js'],
      rules: {
        '@typescript-eslint/no-var-requires': 'off'
      }
    }
  ]
};
