/** A value usable either directly or once awaited. */
type MaybePromise<T> = T | Promise<T>;

declare module 'postcss-styled-syntax' {
  import type { CustomSyntax } from 'stylelint';

  type Syntax = Exclude<CustomSyntax, string>;

  export const parse: NonNullable<Syntax['parse']>;
  export const stringify: NonNullable<Syntax['stringify']>;
}

declare module 'stylelint-config-recommended' {
  import type { Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-recommended-scss' {
  import type { Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-standard' {
  import type { Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-standard-scss' {
  import type { Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-order' {
  import type { Plugin } from 'stylelint';

  export default {} as Plugin;
}

declare module 'stylelint-scss' {
  import type { Plugin } from 'stylelint';

  export default {} as Plugin;
}
