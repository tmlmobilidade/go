#!/bin/bash

# Generate only the TypeScript rule IDs and Zod schema from the Go validator.
# The Go generator adds /* * */ separators before imports and the file body.
# Usage: ./generate-validator-rules.sh [--check] [output_directory]
#
# With --check, the output file is not changed. Package and Docker builds use
# the committed file; only generation and freshness checks require Go.

set -e

CHECK_ONLY=false
if [ "$1" = "--check" ]; then
    CHECK_ONLY=true
    shift
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VALIDATOR_DIR="${PROJECT_ROOT}/modules/operation/apps/validator/validator/src"
OUTPUT_DIR="${1:-${PROJECT_ROOT}/packages-new/types/gtfs-validator/src/rules-new}"
TARGET="${OUTPUT_DIR}/rule-ids.ts"

if ! command -v go > /dev/null 2>&1; then
    printf 'Go is required to generate the validator rules. Install the version declared in %s/go.mod.\n' "${VALIDATOR_DIR}" >&2
    exit 1
fi

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

if [ "${CHECK_ONLY}" = false ]; then
    printf 'Generating validator rule IDs from the Go validator...\n'
fi

if ! (cd "${VALIDATOR_DIR}" && go run ./cmd/rules-catalogue --output-dir "${TEMP_DIR}"); then
    printf 'The rules-catalogue command failed. Nothing was written.\n' >&2
    exit 1
fi

SOURCE="${TEMP_DIR}/rule-ids.ts"
if [ ! -f "${SOURCE}" ]; then
    printf 'The rules-catalogue command did not produce rule-ids.ts. Nothing was written.\n' >&2
    exit 1
fi

if [ "${CHECK_ONLY}" = true ]; then
    STALE=false
    if [ ! -f "${TARGET}" ]; then
        printf 'Missing validator rule IDs file: %s\n' "${TARGET}" >&2
        STALE=true
    elif ! diff -u "${TARGET}" "${SOURCE}"; then
        STALE=true
    fi
    if [ "${STALE}" = true ]; then
        printf 'Validator rule IDs are out of date. Run `npm run repo:validator-rules` and commit the result.\n' >&2
        exit 1
    fi
    printf 'Validator rule IDs are up to date.\n'
    exit 0
fi

mkdir -p "${OUTPUT_DIR}"
cp "${SOURCE}" "${TARGET}"
printf 'Wrote %s\n' "${TARGET}"
