/* eslint import/no-commonjs: "off" -- Unsupported by Stylelint */

const { makeStylelintConfig } = require('./dist/codeformat.cjs');

module.exports = {
  ...makeStylelintConfig(),
};
