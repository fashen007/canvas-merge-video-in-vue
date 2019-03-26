// http://eslint.org/docs/user-guide/configuring

module.exports = {
  root: true,
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  env: {
    browser: true,
  },
  // https://github.com/feross/standard/blob/master/RULES.md#javascript-standard-style
  extends: 'standard',
  // required to lint *.vue files
  plugins: [
    'html'
  ],
  // add your custom rules here
  "rules": {
    "vue/no-parsing-error": [
    2,
    {
        "x-invalid-end-tag": false
    }
    ],
    "comma-dangle": 0,
    "no-unused-vars": 0,
    "no-extra-parens": 0,
    "camelcase": 0,
    "arrow-parens": 0,
    "generator-star-spacing": 0,
    "no-callback-literal": 0,
    "no-return-await": 0,
    "object-curly-spacing": 0,
    "indent": 0,
    "key-spacing": 0,
    "no-trailing-spaces": 0,
    "no-multi-spaces": 0,
    "semi": 0,
    'eqeqeq': 'off',
    "space-before-blocks": 0,
    "no-useless-escape": 0,
    "spaced-comment": 0,
    "quotes": 0,
    "no-useless-return": 0,
    "space-before-function-paren": 0,
    "no-multiple-empty-lines": 0,
    "vue/no-side-effects-in-computed-properties": 0,
    "vue/no-use-v-if-with-v-for": 0,
    "no-tabs": 0,
    "no-parsing-error": 0,
    "vue/no-parsing-error": 0,
    "standard/no-callback-literal": 0,
    "prefer-promise-reject-errors": [
    "error",
    {
        "allowEmptyReject": true
    }],
    'no-debugger': process.env.NODE_ENV === 'production' ? 2 : 0
}
}
