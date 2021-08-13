/* eslint-disable @typescript-eslint/no-var-requires */
const base = require('@subsocial/config/eslintrc')

// add override for any (a metric ton of them, initial conversion)
module.exports = {
  ...base,
  rules: {
    '@typescript-eslint/explicit-module-boundary-types': 'off',
    'semi': [ 'warn', 'never' ],
    'quotes': [ 'warn', 'single' ],
    'no-multi-spaces': 'error',
    'space-before-function-paren': [ 'warn', 'always' ],
    'non-nullish value': 'off',
    '@typescript-eslint/ban-types': 'off',
    '@typescript-eslint/no-explicit-any': 'off',
    '@typescript-eslint/no-non-null-assertion': 'off',
    '@typescript-eslint/explicit-function-return-type': 'off',
    '@typescript-eslint/no-use-before-define': 'off',
    '@typescript-eslint/member-delimiter-style': [ 'warn', {'multiline': {'delimiter': 'none'}} ],
    'prefer-const': 'off',
    'jsx-quotes': [ 'warn', 'prefer-single' ],
  }
}
