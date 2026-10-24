#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
BIN_DIR="$SCRIPT_DIR/../ts-wrapper/bin"
RUNTIME_BIN_DIR="$SCRIPT_DIR/../ts-wrapper/dist/bin"
VALIDATOR_GO_CACHE_DIR="${GOCACHE:-${TMPDIR:-/tmp}/go-plans-validator-cache}"

case "${1:---local}" in
	--local)
		case "$(uname -s)" in
			Darwin) TARGET_OS="darwin" ;;
			Linux) TARGET_OS="linux" ;;
			*) echo "Unsupported validator operating system: $(uname -s)" >&2; exit 1 ;;
		esac
		case "$(uname -m)" in
			arm64|aarch64) TARGET_ARCH="arm64" ;;
			x86_64|amd64) TARGET_ARCH="amd64" ;;
			*) echo "Unsupported validator architecture: $(uname -m)" >&2; exit 1 ;;
		esac
		TARGETS=("$TARGET_OS/$TARGET_ARCH")
		;;
	--all) TARGETS=(linux/amd64 linux/arm64 darwin/amd64 darwin/arm64) ;;
	*) echo "Usage: $0 [--local|--all]" >&2; exit 1 ;;
esac

if [ "$#" -gt 1 ]; then
	echo "Usage: $0 [--local|--all]" >&2
	exit 1
fi

echo "Cleaning validator binary directories..."
rm -rf -- "$BIN_DIR" "$RUNTIME_BIN_DIR"
mkdir -p "$BIN_DIR" "$RUNTIME_BIN_DIR" "$VALIDATOR_GO_CACHE_DIR"

for TARGET in "${TARGETS[@]}"; do
	TARGET_OS="${TARGET%/*}"
	TARGET_ARCH="${TARGET#*/}"
	BINARY_PATH="$BIN_DIR/validator-$TARGET_OS-$TARGET_ARCH"

	echo "Building GTFS validator binary: $BINARY_PATH"
	(
		cd "$SCRIPT_DIR/src"
		CGO_ENABLED=0 GOCACHE="$VALIDATOR_GO_CACHE_DIR" GOOS="$TARGET_OS" GOARCH="$TARGET_ARCH" \
			go build -o "$BINARY_PATH" .
	)
	chmod +x "$BINARY_PATH"
	# The compiled TypeScript wrapper executes the binary from dist/bin.
	cp -p "$BINARY_PATH" "$RUNTIME_BIN_DIR/"
done

if [ "${1:---local}" = "--local" ]; then
	BINARY_VERSION="$("$BINARY_PATH" -version)"
	echo "GTFS validator binary ready: $BINARY_VERSION"
fi

echo "Build completed successfully"
