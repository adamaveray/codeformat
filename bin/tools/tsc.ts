import runners from '../utils/runners.ts';
import { type Tool } from '../utils/types.ts';

export default {
  exec: runners.bun,
  command: 'tsc',
  actions: (configPath) => ({
    check: ['--noEmit', '--project', configPath],
    fix: ['--project', configPath],
  }),
  configFiles: ['tsconfig.json'],
} satisfies Tool;
