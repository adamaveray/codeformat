#!/usr/bin/env bun

import { existsSync } from 'node:fs';
import path from 'node:path';
import { parseArgs } from 'node:util';

import { spawn } from 'bun';

type Action = 'check' | 'fix';

// Parse input
const { values: options, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    verbose: { type: 'boolean', default: false },
    debug: { type: 'boolean', default: false },
    help: { type: 'boolean', default: false },
    dir: { type: 'string', short: 'd', default: process.cwd() },
  },
  strict: true,
  allowPositionals: true,
});
const { dir: projectDir } = options;
const [, scriptName, selectedAction, ...undefinedArgs] = positionals as [string, string, ...string[]];

const output = {
  usage(exitCode: number = 0): never {
    console.error(`Usage:
  ${scriptName} check [root-path]
  ${scriptName} fix [root-path]`);
    process.exit(exitCode);
  },

  debug(message: string, additionalValues: unknown[] = []): void {
    if (options.debug) {
      console.debug(message, ...additionalValues);
    }
  },

  verbose(message: string, additionalValues: unknown[] = []): void {
    if (options.verbose) {
      console.debug(message, ...additionalValues);
    }
  },

  error(message: string, additionalValues: unknown[] = [], exitCode: number = 1): never {
    console.error(message, ...additionalValues);
    process.exit(exitCode);
  },
};

async function bunx(command: string, args: string[]): Promise<void> {
  output.verbose('Running command:', [command, ...args]);

  const proc = spawn(['bun', '--bun', 'x', command, ...args], {
    cwd: projectDir,
    stdio: ['inherit', 'inherit', 'inherit'],
  });
  const exitCode = await proc.exited;
  if (exitCode !== 0) {
    process.exit(exitCode);
  }
}

function withExts(base: string, exts: string[]): string[] {
  return exts.map((ext) => `${base}.${ext}`);
}

function findFirstFile(suffixes: string[]): string | undefined {
  for (const suffix of suffixes) {
    const filePath = path.join(projectDir, suffix);
    if (existsSync(filePath)) {
      const relativeFilePath = path.isAbsolute(projectDir) ? path.relative(projectDir, filePath) : filePath;
      output.debug('Found config file:', [filePath]);
      return relativeFilePath;
    }
  }
  return undefined;
}

function ifConfig<T>(pathname: string | undefined, callback: (pathname: string) => T): T | undefined {
  return pathname == null ? undefined : callback(pathname);
}

if (options.help) {
  output.usage();
}
if (undefinedArgs.length > 0) {
  output.error('Unexpected additional arguments.', [undefinedArgs]);
}

const configPaths = {
  prettier: findFirstFile([
    '.prettierrc',
    ...withExts('prettier.config', ['js', 'ts', 'mjs', 'mts', 'cjs', 'cts']),
    ...withExts('.prettierrc', ['json', 'yml', 'yaml', 'json5', 'js', 'ts', 'mjs', 'mts', 'cjs', 'cts', 'toml']),
  ]),
  eslint: findFirstFile(withExts('eslint.config', ['js', 'mjs', 'cjs', 'ts', 'mts', 'cts'])),
  typeScript: findFirstFile(['tsconfig.json']),
  stylelint: findFirstFile(withExts('stylelint.config', ['cjs', 'mjs', 'js'])),
};

interface Tool {
  actions: Partial<Record<Action, string[]>> | undefined;
  args: Partial<{
    debug: string[];
  }>;
}

const tools: Record<string, Tool> = {
  prettier: {
    actions: ifConfig(configPaths.prettier, (configPath) => ({
      check: ['--check', '--config', configPath, projectDir],
      fix: ['--write', '--config', configPath, projectDir],
    })),
    args: {
      debug: ['--log-level', 'debug'],
    },
  },
  eslint: {
    actions: ifConfig(configPaths.eslint, (configPath) => ({
      check: ['--config', configPath, projectDir],
      fix: ['--fix', '--config', configPath, projectDir],
    })),
    args: {
      debug: ['--debug'],
    },
  },
  tsc: {
    actions: ifConfig(configPaths.typeScript, (configPath) => ({
      check: ['--noEmit', '--project', configPath],
      fix: ['--project', configPath],
    })),
    args: {},
  },
  stylelint: {
    actions: ifConfig(configPaths.stylelint, (configPath) => ({
      check: ['--allow-empty-input', '--config', configPath, `${projectDir}/**/*.{css,sass,scss}`],
      fix: ['--fix', '--allow-empty-input', '--config', configPath, `${projectDir}/**/*.{css,sass,scss}`],
    })),
    args: {
      debug: ['--formatter', 'verbose'],
    },
  },
};

async function runTools(action: Action): Promise<void> {
  for (const [toolName, { actions, args: additionalArgs }] of Object.entries(tools)) {
    const actionArgs = actions?.[action];
    if (actionArgs != null) {
      let args = [...actionArgs];
      if (options.debug) {
        args = [...args, ...(additionalArgs.debug ?? [])];
      }
      // eslint-disable-next-line no-await-in-loop -- Must be run in series
      await bunx(toolName, args);
    }
  }
}

try {
  switch (selectedAction) {
    case 'check': {
      await runTools('check');
      break;
    }

    case 'fix': {
      await runTools('fix');
      break;
    }

    default: {
      output.usage(1);
    }
  }
} catch (error) {
  output.error('Error:', [error]);
}
