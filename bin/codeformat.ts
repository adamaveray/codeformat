#!/usr/bin/env bun

import { argv } from 'node:process';

import {
  knip,
  magoAnalyze,
  magoFormat,
  magoGuard,
  magoLint,
  oxfmt,
  oxlint,
  stylelint,
  vitePlusFmt,
  vitePlusLint,
} from './tools/index.ts';
import Cli from './utils/Cli.ts';
import ToolRunner from './utils/ToolRunner.ts';

const { cli, selectedAction, selectedTool } = Cli.createFromArgs(argv);

const runner = new ToolRunner(cli, {
  // Formatting
  vitePlusFmt,
  oxfmt,

  // Dead code detection
  knip,

  // Linting & type checking
  vitePlusLint,
  oxlint,

  // CSS/SCSS
  stylelint,

  // PHP
  magoFormat,
  magoLint,
  magoAnalyze,
  magoGuard,
});

try {
  await runner.run(selectedAction, selectedTool);
} catch (error) {
  cli.output.error('Error:', [error]);
}
