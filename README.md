# @averay/codeformat

A very opinionated collection of configurations for a number of code formatting tools.

## Default Usage

1. Install the package with `npm i -D @averay/codeformat`

2. Symlink the static configuration files to the project root:

   ```sh
   ln -s node_modules/@averay/codeformat/.editorconfig node_modules/@averay/codeformat/.prettierrc.json ./
   ```

3. Import and call the relevant configuration builders for specific tools

### ESLint

Create an `eslint.config.js` file and create the configuration:

```js
// eslint.config.js
import { makeEslintConfig } from '@averay/codeformat';

export default [
  {
    ignores: ['dist/**/*'],
  },
  ...makeEslintConfig({ tsconfigPath: './tsconfig.json' }),
  // Custom overrides can be added here
];
```

### Stylelint

Create a `stylelint.config.cjs` file and create the configuration:

```js
// stylelint.config.cjs
const { makeStylelintConfig } = require('@averay/codeformat');

module.exports = makeStylelintConfig();
```

_(Stylelint does not currently support ESM so a `.cjs` file with CommonJS import & export syntax must be used)_
