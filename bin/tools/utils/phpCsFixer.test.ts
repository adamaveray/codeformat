import process from 'node:process';
import { describe, expect, it } from 'vite-plus/test';

import type { ScopeFileContext } from '../../utils/types.ts';

import Output from '../../utils/Output.ts';
import { buildScopedConfig, scopeFile, toPhpString } from './phpCsFixer.ts';

describe(toPhpString, () => {
  it.for([
    ['a plain string', '/project/src/a.php', String.raw`'/project/src/a.php'`],
    ['an empty string', '', `''`],
    ['single quotes', "/project/it's.php", String.raw`'/project/it\'s.php'`],
    ['backslashes', String.raw`C:\project\a.php`, String.raw`'C:\\project\\a.php'`],
    ['a trailing backslash', String.raw`/project\\`, String.raw`'/project\\\\'`],
    ['an escaped quote', String.raw`/project/\'`, String.raw`'/project/\\\''`],
    ['interpolation syntax', '/project/$a{$b}.php', `'/project/$a{$b}.php'`],
  ] as const satisfies readonly (readonly [label: string, value: string, expected: string])[])(
    'escapes %s',
    ([, value, expected]) => {
      expect(toPhpString(value)).toBe(expected);
    },
  );
});

describe(buildScopedConfig, () => {
  const contents = buildScopedConfig('/project/.php-cs-fixer.php', ['/project/src/a.php', "/project/it's.php"]);

  it('loads the project configuration', () => {
    expect(contents).toContain(`$config = require '/project/.php-cs-fixer.php';`);
  });

  it('lists the given paths', () => {
    expect(contents).toContain(String.raw`['/project/src/a.php', '/project/it\'s.php']`);
  });

  it('filters the project finder', () => {
    expect(contents).toContain('foreach ($config->getFinder() as $file)');
    expect(contents).toContain('return $config->setFinder($files);');
  });

  it('opens with a PHP tag', () => {
    expect(contents.startsWith('<?php\n')).toBe(true);
  });
});

describe('scopeFile.build', () => {
  const context = (rootPath: string): ScopeFileContext => ({
    rootPath,
    configPath: '.php-cs-fixer.php',
    capture: async () => ({ exitCode: 0, stdout: '' }),
    output: new Output('test', { debug: false, verbose: false }),
  });

  it.for([
    ['an absolute root', '/project', '/project'],
    ['a relative root', 'project', `${process.cwd()}/project`],
  ] as const satisfies readonly (readonly [label: string, rootPath: string, expected: string])[])(
    'resolves paths against %s',
    async ([, rootPath, expected]) => {
      const { contents } = await scopeFile.build(['src/a.php'], context(rootPath));
      expect(contents).toContain(`require '${expected}/.php-cs-fixer.php';`);
      expect(contents).toContain(`['${expected}/src/a.php']`);
    },
  );
});
