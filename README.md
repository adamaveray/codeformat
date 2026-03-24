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

Create a `mago.toml` file with the following example configuration:

```toml
[formatter]
print-width = 120

[source]
paths = ["."]
excludes = ["vendor"]
```
