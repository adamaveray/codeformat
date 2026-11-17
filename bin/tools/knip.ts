import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import path from 'node:path';

import type { Tool } from '../utils/types.ts';

import extensions from '../../src/extensions.ts';
import { withExts } from '../utils/filesystem.ts';
import runners from '../utils/runners.ts';

const CONFIG_HASH_LENGTH = 16;

/**
 * Generate a unique cache filename based on the config contents (forces Knip cache invalidation on config changes).
 */
function getConfigCacheName(rootPath: string, configPath: string): string {
  const hash = createHash('sha256')
    .update(readFileSync(path.resolve(rootPath, configPath)))
    .digest('hex')
    .slice(0, CONFIG_HASH_LENGTH);
  const { name, ext } = path.parse(configPath);
  return `${name}.${hash}${ext}`;
}

const commonArgs = ['--treat-config-hints-as-errors'];
export default {
  runner: runners.viteplus.exec,
  command: 'knip',
  actions: ({ configPath }) => ({
    check: ['--config', configPath, ...commonArgs],
    fix: ['--fix', '--config', configPath, ...commonArgs],
  }),
  args: {
    debug: ['--debug'],
    cache: (cacheDir, { rootPath, configPath }) =>
      cacheDir == null
        ? []
        : ['--cache', '--cache-location', path.join(cacheDir, getConfigCacheName(rootPath, configPath))],
  },
  configFiles: [
    ...withExts('knip', ['json', 'jsonc', ...extensions.js, ...extensions.ts]),
    ...withExts('.knip', ['json', 'jsonc']),
    ...withExts('knip.config', [...extensions.js, ...extensions.ts]),
  ],
  perFile: false,
} satisfies Tool;
