#!/usr/bin/env bun

import { knip, oxfmt, oxlint, phpCsFixer, prettier, stylelint, tsc } from './tools/index.ts';
import Cli from './utils/Cli.ts';
import ToolRunner from './utils/ToolRunner.ts';

const { cli, selectedAction, selectedTool } = Cli.createFromArgs(Bun.argv);

const runner = new ToolRunner(cli, {
  // Formatting
  oxfmt,
  prettier,

  // Dead code detection
  knip,

  // Linting & type checking (`--type-check` replaces standalone `tsc --noEmit`)
  oxlint,

  // Standalone type checking (kept for backwards compat, superseded by oxlint `--type-check`)
  tsc,

  // Other languages
  stylelint,
  phpCsFixer,
});

try {
  await runner.run(selectedAction, selectedTool);
} catch (error) {
  cli.output.error('Error:', [error]);
}
