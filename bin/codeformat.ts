#!/usr/bin/env node

import { argv, exit } from 'node:process';

import {
  knip,
  magoAnalyze,
  magoFormat,
  magoGuard,
  magoLint,
  phpCsFixer,
  stylelint,
  swiftFormat,
  vitePlusFmt,
  vitePlusLint,
} from './tools/index.ts';
import Cli from './utils/Cli.ts';
import ToolRunner from './utils/ToolRunner.ts';

const { cli, selectedAction, selectedTool } = Cli.createFromArgs(argv);

const runner = new ToolRunner(cli, {
  // Formatting
  vitePlusFmt,

  // Dead code detection
  knip,

  // Linting & type checking
  vitePlusLint,

  // CSS/SCSS
  stylelint,

  // PHP
  phpCsFixer,
  magoFormat,
  magoLint,
  magoAnalyze,
  magoGuard,

  // Swift
  swiftFormat,
});

try {
  exit(await runner.run(selectedAction, selectedTool));
} catch (error) {
  cli.output.error('Error:', [error]);
}
