# @averay/codeformat

A very opinionated collection of configurations for a number of code formatting tools.

## Default Usage

1. Install the package with `bun i -D @averay/codeformat`

2. Symlink the static configuration files to the project root:

   ```sh
   ln -s node_modules/@averay/codeformat/.editorconfig ./
   ```

3. Import and call the relevant configuration builders for specific tools

4. Lint the codebase with `bun x codeformat check`, or apply automatic fixes with `bun x codeformat fix`

### Oxfmt

Create an `.oxfmtrc.json` file, or generate one programmatically:

```ts
import { makeOxfmtConfig } from '@averay/codeformat';

const config = makeOxfmtConfig(/* Customisations can be made here */);
// Write to .oxfmtrc.json
```

### Oxlint

Create an `oxlint.config.ts` file with the following configuration:

```ts
// oxlint.config.ts
import { makeOxlintConfig } from '@averay/codeformat';

export default makeOxlintConfig({ tsconfigPath: './tsconfig.json' });
```

### Prettier (PHP/XML/INI only)

Create a `prettier.config.ts` file with the following configuration:

```ts
// prettier.config.ts
import { makePrettierConfig } from '@averay/codeformat';

export default makePrettierConfig({ php: true });
```

### Stylelint

Create a `stylelint.config.ts` file with the following configuration:

```ts
// stylelint.config.ts
import { makeStylelintConfig } from '@averay/codeformat';

export default makeStylelintConfig();
```

### Knip

Create a `knip.config.ts` file with the following configuration:

```ts
// knip.config.ts
import type { KnipConfig } from 'knip';

export default {
  entry: ['src/index.ts'],
  project: ['src/**/*.ts'],
} satisfies KnipConfig;
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
