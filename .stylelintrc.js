module.exports = {
  plugins: ['stylelint-order'],
  extends: ['stylelint-config-recommended'],
  rules: {
    'order/properties-alphabetical-order': true,
    'property-no-unknown': [
      true,
      {
        ignoreProperties: ['composes', 'compose-with']
      }
    ],
    'selector-pseudo-class-no-unknown': [
      true,
      {
        ignorePseudoClasses: ['global']
      }
    ]
  }
};
