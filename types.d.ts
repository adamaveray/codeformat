declare module '@stylistic/eslint-plugin' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended-flat', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-config-prettier' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Config;
}

declare module 'eslint-plugin-eslint-comments' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-plugin-import' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended' | 'react' | 'react-native' | 'electron' | 'typescript', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-plugin-jsdoc' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-plugin-promise' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-plugin-sonarjs' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended', TSESLint.FlatConfig.Config>;
  };
}

declare module 'eslint-plugin-unicorn' {
  import { type TSESLint } from '@typescript-eslint/utils';

  export default {} as TSESLint.FlatConfig.Plugin & {
    configs: Record<'recommended', TSESLint.FlatConfig.Config>;
  };
}

declare module 'stylelint-config-recommended' {
  import { type Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-recommended-scss' {
  import { type Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-standard' {
  import { type Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-config-standard-scss' {
  import { type Config } from 'stylelint';

  export default {} as Config;
}

declare module 'stylelint-order' {
  import { type Plugin } from 'stylelint';

  export default {} as Plugin;
}

declare module 'stylelint-scss' {
  import { type Plugin } from 'stylelint';

  export default {} as Plugin;
}

declare module 'stylelint-use-logical' {
  import { type Plugin } from 'stylelint';

  export default {} as Plugin;
}
