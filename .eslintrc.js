module.exports = {
  extends: "airbnb-base",
  "env": {
    "browser": true,
  },
  "rules": {
    "function-paren-newline": 0,
    "object-curly-newline": 0,
    "no-plusplus": [2, { "allowForLoopAfterthoughts": true }],
    "no-param-reassign": [2, { "props": false }],
  },
};
