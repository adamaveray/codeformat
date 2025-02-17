#!/bin/sh

set -e

bunx() {
  bun --bun x "$@"
}

# Parse arguments
ACTION="$1"
DIR="$2"
if [ "$DIR" = '' ]; then
  DIR='.'
fi

CONFIG_PATH_TYPESCRIPT="$DIR/tsconfig.json"

if [ "$ACTION" = 'check' ]; then
  bunx prettier --check "$DIR"
  bunx eslint "$DIR"
  if [ -f "$CONFIG_PATH_TYPESCRIPT" ]; then
    bunx tsc --noEmit --project "$DIR/tsconfig.json"
  fi
  bunx stylelint --allow-empty-input "$DIR/**/*.{css,sass,scss}"
elif [ "$ACTION" = 'fix' ]; then
  bunx prettier --write "$DIR"
  bunx eslint --fix "$DIR"
  bunx stylelint --fix --allow-empty-input "$DIR/**/*.{css,sass,scss}"
else
  # Invalid/unset arguments
  echo "Usage:
  $0 check [root-path]
  $0 fix [root-path]" >&2
  exit 1
fi
