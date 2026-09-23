#!/bin/bash

# Generate the TypeScript validation-rule files from the Go validator.
# Usage: ./generate-validator-rules.sh [--check] [output_directory]
#
# With --check, no output files are changed. Package and Docker builds use the
# committed files; only generation and freshness checks require Go.

set -e

CHECK_ONLY=false
if [ "$1" = "--check" ]; then
    CHECK_ONLY=true
    shift
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VALIDATOR_DIR="${PROJECT_ROOT}/modules/operation/apps/validator/validator/src"
OUTPUT_DIR="${1:-${PROJECT_ROOT}/packages-new/types/gtfs-validator/src/rules}"

if ! command -v go > /dev/null 2>&1; then
    printf 'Go is required to generate the validator rules. Install the version declared in %s/go.mod.\n' "${VALIDATOR_DIR}" >&2
    exit 1
fi

TEMP_DIR=$(mktemp -d)
trap 'rm -rf "${TEMP_DIR}"' EXIT

if [ "${CHECK_ONLY}" = false ]; then
    printf 'Generating validator rules from the Go validator...\n'
fi

if ! (cd "${VALIDATOR_DIR}" && go run ./cmd/rules-catalogue --output-dir "${TEMP_DIR}"); then
    printf 'The rules-catalogue command failed. Nothing was written.\n' >&2
    exit 1
fi

shopt -s nullglob
GENERATED_FILES=("${TEMP_DIR}"/*.ts)
if [ "${#GENERATED_FILES[@]}" -eq 0 ]; then
    printf 'The rules-catalogue command produced no output. Nothing was written.\n' >&2
    exit 1
fi

if [ "${CHECK_ONLY}" = true ]; then
    STALE=false
    for SOURCE in "${GENERATED_FILES[@]}"; do
        TARGET="${OUTPUT_DIR}/$(basename "${SOURCE}")"
        if [ ! -f "${TARGET}" ]; then
            printf 'Missing validator rules file: %s\n' "${TARGET}" >&2
            STALE=true
        elif ! diff -u "${TARGET}" "${SOURCE}"; then
            STALE=true
        fi
    done
    if [ -f "${OUTPUT_DIR}/rules.generated.ts" ]; then
        printf 'Obsolete validator rules file: %s/rules.generated.ts\n' "${OUTPUT_DIR}" >&2
        STALE=true
    fi
    if [ "${STALE}" = true ]; then
        printf 'Validator rules are out of date. Run `npm run repo:validator-rules` and commit the result.\n' >&2
        exit 1
    fi
    printf 'Validator rules are up to date.\n'
    exit 0
fi

mkdir -p "${OUTPUT_DIR}"
for SOURCE in "${GENERATED_FILES[@]}"; do
    TARGET="${OUTPUT_DIR}/$(basename "${SOURCE}")"
    cp "${SOURCE}" "${TARGET}"
    printf 'Wrote %s\n' "${TARGET}"
done
rm -f "${OUTPUT_DIR}/rules.generated.ts"
