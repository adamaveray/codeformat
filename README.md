# @averay/codeformat

A very opinionated collection of configurations for a number of code formatting tools.

## Default Usage

1. Install the package with `npm i -D @averay/codeformat`

2. Symlink the static configuration files to the project root:

   ```sh
   ln -s node_modules/@averay/codeformat/.editorconfig node_modules/@averay/codeformat/.prettierrc.json ./
   ```

3. Generate the ESLint configuration after any custom ignore definitions:

   ```js
   // eslint.config.js
   import { makeEslintConfig } from '@averay/codeformat';

   export default [
     {
       ignores: ['dist/**/*'],
     },
     ...makeEslintConfig({ tsconfigPath: './tsconfig.json' }),
   ];
   ```
