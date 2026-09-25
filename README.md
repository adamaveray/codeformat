# @averay/codeformat

A very opinionated collection of configurations for a number of code formatting tools.

## Default Usage

1. Install [Vite+](https://viteplus.dev) and this package with `vp i -D @averay/codeformat`.

2. Symlink the static configuration files to the project root:

   ```sh
   ln -s node_modules/@averay/codeformat/.editorconfig ./
   ```

3. Import and call the relevant configuration builders for specific tools

4. Lint the codebase with `vpx codeformat check`, or apply automatic fixes with `vpx codeformat fix`

### Vite+ Format (via Oxfmt)

Create a `vite.config.ts` file, or generate one programmatically:

```ts
// vite.config.ts
import { makeOxfmtConfig } from '@averay/codeformat';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  fmt: makeOxfmtConfig(/* Customisations can be made here */),
});
```

### Vite+ Lint (via Oxlint)

Create an `oxlint.config.ts` file with the following configuration:

```ts
// vite.config.ts
import { makeOxlintConfig } from '@averay/codeformat';
import { defineConfig } from 'vite-plus';

export default defineConfig({
  lint: makeOxlintConfig({ tsconfigPath: './tsconfig.json' }),
});
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

### Mago (PHP)

Create a `mago.toml` file with the following configuration:

```toml
#:schema vendor/carthage-software/mago/schema.json
extends = "node_modules/@averay/codeformat/mago.base.toml"

[source]
paths = ["."]
```

### PHP-CS-Fixer (PHP)

Configure autoloading utility in `composer.json`:

```json
{
  // ...
  "autoload-dev": {
    "files": ["node_modules/@averay/codeformat/autoload.php"]
  }
  // ...
}
```

Then, create a `.php-cs-fixer.dist.php` file with the following configuration:

```php
<?php

declare(strict_types=1);

$finder = new PhpCsFixer\Finder()->in([__DIR__])->exclude(['node_modules', 'vendor']);

return Averay\Codeformat\PhpCsFixerConfig::default($finder);
```

### swift-format (Swift)

Symlink the configuration file to the project root:

```sh
ln -s node_modules/@averay/codeformat/.swift-format ./
```
