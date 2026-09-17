import type { Tool } from '../utils/types.ts';

import { buildIgnoreList } from '../utils/ignores.ts';
import runners from '../utils/runners.ts';

const commonArgs = ['--recursive', '--parallel'];

/** The first version able to restrict a run through an ignore file. */
const minimumMajorVersion = 604;

/**
 * @param version The version the tool reports.
 * @param minimumMajor The oldest major version to accept.
 * @returns Whether the version is new enough. Builds reporting a name rather than a number are assumed current.
 */
export function isSupportedVersion(version: string, minimumMajor: number): boolean {
  const major = /^(?<major>\d+)/v.exec(version.trim())?.groups?.['major'];
  return major == null || Number(major) >= minimumMajor;
}

export default {
  runner: runners.system,
  command: 'swift-format',
  actions: ({ configPath }) => ({
    check: ['lint', ...commonArgs, '--strict', '--configuration', configPath, '.'],
    fix: ['format', ...commonArgs, '--in-place', '--configuration', configPath, '.'],
  }),
  args: {},
  configFiles: ['.swift-format'],
  scopeFile: {
    id: 'swiftFormatIgnoreList',
    location: {
      kind: 'projectFile',
      fileName: '.swift-format-ignore', // Non-configurable - must use exactly this path in the project
    },
    build: async (paths, { capture, output }) => {
      const { stdout } = await capture(['--version']);
      if (!isSupportedVersion(stdout, minimumMajorVersion)) {
        output.error(`Version ${minimumMajorVersion} or newer of swift-format is required.`);
      }

      return buildIgnoreList(paths, 'swiftFormat');
    },
  },
  supportedExtensions: ['swift'],
} satisfies Tool;
