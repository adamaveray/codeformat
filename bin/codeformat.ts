#!/usr/bin/env bun

import { eslint, phpCsFixer, prettier, stylelint, tsc } from './tools/index.ts';
import Cli from './utils/Cli.ts';
import ToolRunner from './utils/ToolRunner.ts';

const { cli, selectedAction, selectedTool } = Cli.createFromArgs(Bun.argv);

const runner = new ToolRunner(cli, {
  // Common
  prettier,

  // JavaScript/TypeScript
  tsc,
  eslint,

  // Other languages
  stylelint,
  phpCsFixer,
});

try {
  await runner.run(selectedAction, selectedTool);
} catch (error) {
  cli.output.error('Error:', [error]);
}
