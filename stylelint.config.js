/* eslint import/no-commonjs: "off" -- Unsupported by Stylelint */

import { makeStylelintConfig } from './src/index.ts';

export default {
  ...makeStylelintConfig(),
};
