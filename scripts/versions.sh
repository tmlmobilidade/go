#!/usr/bin/env bash
# Generate version in format YYYYMMDD.HHMM.SS
# Accepts injected env vars from workflow:
#   VERSION_OVERRIDE - use this version instead of generating (from workflow_dispatch input)
#   VERSION_TZ       - timezone for date (default: Europe/Lisbon)

get_version() {
  if [[ -n "${VERSION_OVERRIDE:-}" ]]; then
    echo "$VERSION_OVERRIDE"
    return
  fi
  TZ="${VERSION_TZ:-Europe/Lisbon}" date +%Y%m%d.%H%M.%S
}

get_version
