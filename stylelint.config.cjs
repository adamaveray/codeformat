/* eslint import/no-commonjs: "off" -- Unsupported by Stylelint */

const { makeStylelintConfig } = require('./src/index.ts');

module.exports = {
  ...makeStylelintConfig(),
};
