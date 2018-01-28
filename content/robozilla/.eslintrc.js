module.exports = {
  extends: "airbnb-base",
  "env": {
    "browser": true,
  },
  "rules": {
    "function-paren-newline": 0,
    "object-curly-newline": 0,
    "object-curly-spacing": 0,
    "no-underscore-dangle": 0,
    "no-mixed-operators": 0,
    "import/no-extraneous-dependencies": [2, {"optionalDependencies": true}],
    "no-plusplus": [2, { "allowForLoopAfterthoughts": true }],
    "no-param-reassign": [2, { "props": false }],
  },
};
