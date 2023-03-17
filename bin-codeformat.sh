#!/bin/sh

set -e

# Parse arguments
ACTION="$1"
DIR="$2"
if [ "$DIR" = '' ]; then
  DIR='.'
fi

CONFIG_PATH_TYPESCRIPT="$DIR/tsconfig.json"

if [ "$ACTION" = 'check' ]; then
  npx eslint "$DIR"
  npx prettier --check "$DIR"
  if [ -f "$CONFIG_PATH_TYPESCRIPT" ]; then
    npx tsc --noEmit --project "$DIR/tsconfig.json"
  fi
  npx stylelint --allow-empty-input "$DIR/**/*.{css,sass,scss}"
elif [ "$ACTION" = 'fix' ]; then
  npx eslint --fix "$DIR"
  npx prettier --write "$DIR"
  npx stylelint --fix --allow-empty-input "$DIR/**/*.{css,sass,scss}"
else
  # Invalid/unset arguments
  echo "Usage:
  $0 check [root-path]
  $0 fix [root-path]" >&2
  exit 1
fi
