#!/usr/bin/env bash
# Generate semver-safe version (YYYYMMDD.<HHMMSS as int>.0) for npm and the UI package.
# Writes packages/ui/src/types/version.ts (line `const version = '…';`).
#
# Env (from CI):
#   VERSION_OVERRIDE - use this version instead of generating
#   VERSION_TZ       - timezone (default: Europe/Lisbon)
#
# Args:
#   --print-only     only print version to stdout; do not change files (for job that only needs the string)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT="$(cd "$SCRIPT_DIR/.." && pwd)"
VERSION_FILE="${ROOT}/packages/ui/src/types/version.ts"

print_only=false
if [[ "${1:-}" == '--print-only' ]]; then
  print_only=true
fi

get_version() {
  if [[ -n "${VERSION_OVERRIDE:-}" ]]; then
    echo "$VERSION_OVERRIDE"
    return
  fi
  local TZ="${VERSION_TZ:-Europe/Lisbon}"
  local d h m s t
  d="$(TZ="$TZ" date +%Y%m%d)"
  h="$(TZ="$TZ" date +%H)"
  m="$(TZ="$TZ" date +%M)"
  s="$(TZ="$TZ" date +%S)"
  t=$((10#$h * 10000 + 10#$m * 100 + 10#$s))
  echo "${d}.${t}.0"
}

version="$(get_version)"
echo "$version"

if [[ "$print_only" == true ]]; then
  exit 0
fi

if [[ ! -f "$VERSION_FILE" ]]; then
  echo "error: version file not found: $VERSION_FILE" >&2
  exit 1
fi

if ! grep -q "^const version = '[^']*';" "$VERSION_FILE"; then
  echo "error: expected a line matching \"const version = '…';\" in $VERSION_FILE" >&2
  exit 1
fi

sed -i "s/^const version = '[^']*';/const version = '${version}';/" "$VERSION_FILE"
