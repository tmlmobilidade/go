#!/bin/bash

# Script to generate the TypeScript validation-rule contract from the Go validator.
# Usage: ./generate-validator-rules.sh [--check] [output_file]
#
# Runs the Go `rules-catalogue` command, which derives the rule configuration
# types, rule ids, severities and editor catalogue from the Go rule structs, and
# writes them to @tmlmobilidade/go-types-gtfs-validator. With `--check` nothing
# is written: the script exits non-zero when the committed file is missing or
# out of date. Requires Go; package and Docker builds use the committed file.

set -e

CHECK_ONLY=false
if [ "$1" = "--check" ]; then
    CHECK_ONLY=true
    shift
fi

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
# Go up one level from scripts/ to the project root
PROJECT_ROOT="$(cd "${SCRIPT_DIR}/.." && pwd)"
VALIDATOR_DIR="${PROJECT_ROOT}/modules/operation/apps/validator/validator/src"
OUTPUT_FILE="${1:-${PROJECT_ROOT}/packages-new/types/gtfs-validator/src/rules/rules.generated.ts}"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
NC='\033[0m' # No Color

if ! command -v go > /dev/null 2>&1; then
    printf "${RED}Go is required to generate the validator rules. Install the version declared in ${VALIDATOR_DIR}/go.mod.${NC}\n" >&2
    exit 1
fi

TEMP_FILE=$(mktemp)
trap "rm -f ${TEMP_FILE}" EXIT

if [ "${CHECK_ONLY}" = false ]; then
    printf "${GREEN}Generating validator rules from the Go validator...${NC}\n"
fi

if ! (cd "${VALIDATOR_DIR}" && go run ./cmd/rules-catalogue) > "${TEMP_FILE}"; then
    printf "${RED}The rules-catalogue command failed. Nothing was written.${NC}\n" >&2
    exit 1
fi

if [ ! -s "${TEMP_FILE}" ]; then
    printf "${RED}The rules-catalogue command produced no output. Nothing was written.${NC}\n" >&2
    exit 1
fi

if [ "${CHECK_ONLY}" = true ]; then
    if [ ! -f "${OUTPUT_FILE}" ] || ! diff -q "${TEMP_FILE}" "${OUTPUT_FILE}" > /dev/null; then
        printf "${RED}Validator rules are out of date. Run \`npm run repo:validator-rules\` and commit the result.${NC}\n" >&2
        [ -f "${OUTPUT_FILE}" ] && diff -u "${OUTPUT_FILE}" "${TEMP_FILE}" >&2 || true
        exit 1
    fi
    printf "${GREEN}Validator rules are up to date.${NC}\n"
    exit 0
fi

mkdir -p "$(dirname "${OUTPUT_FILE}")"
cp "${TEMP_FILE}" "${OUTPUT_FILE}"

printf "${GREEN}Wrote ${OUTPUT_FILE}${NC}\n"
