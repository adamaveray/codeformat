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

Create a `stylelint.config.js` file and create the configuration:

```js
// stylelint.config.js
import { makeStylelintConfig } from '@averay/codeformat';

export default makeStylelintConfig();
```

### PHP-CS-Fixer

Create a `.php-cs-fixer.php` file and create the configuration:

```php
<?php
declare(strict_types=1);

require_once __DIR__ . '/vendor/autoload.php';
require_once __DIR__ . '/node_modules/@averay/codeformat/src/php/PhpCsFixerConfig.php';

$finder = (new PhpCsFixer\Finder())->in([__DIR__]);

return PhpCsFixerConfig::default($finder);
```
