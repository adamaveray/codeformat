import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';
import type { Tool } from '../utils/types.ts';

export default {
  exec: runners.composer,
  command: 'php-cs-fixer',
  actions: (configPath) => ({
    check: ['check', '--config', configPath, '-vv'],
    fix: ['fix', '--config', configPath, '-vv'],
  }),
  args: {
    debug: ['--verbose'],
  },
  configFiles: withExts('.php-cs-fixer', ['dist.php', 'php']),
} satisfies Tool;
