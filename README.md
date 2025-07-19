# @averay/codeformat

A very opinionated collection of configurations for a number of code formatting tools.

## Default Usage

1. Install the package with `bun i -D @averay/codeformat`

2. Symlink the static configuration files to the project root:

   ```sh
   ln -s node_modules/@averay/codeformat/.editorconfig node_modules/@averay/codeformat/.prettierrc.json ./
   ```

3. Import and call the relevant configuration builders for specific tools

4. Lint the codebase with `bun x codeformat check`, or apply automatic fixes with `bun x codeformat fix`

### Prettier

Create a `prettier.config.mjs` file with the following configuration:

```js
import { makePrettierConfig } from '@averay/codeformat';

export default makePrettierConfig(/* Customisations can be made here */);
```

### ESLint

Create an `eslint.config.js` file with the following configuration:

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

Create a `stylelint.config.js` file with the following configuration:

```js
// stylelint.config.js
import { makeStylelintConfig } from '@averay/codeformat';

export default makeStylelintConfig();
```

### Knip

Create a `knip.config.js` with

```js
// knip.config.js
import { makeStylelintConfig } from '@averay/codeformat';

export default makeStylelintConfig();
```

### PHP-CS-Fixer

Create a `.php-cs-fixer.php` file with the following configuration:

```php
<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/node_modules/@averay/codeformat/dist/src/php/PhpCsFixerConfig.php';

$finder = new PhpCsFixer\Finder()->in([__DIR__]);

return PhpCsFixerConfig::default($finder);
```
