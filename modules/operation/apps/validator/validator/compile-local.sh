#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"

case "$(uname -s)" in
	Darwin) GOOS="darwin" ;;
	Linux) GOOS="linux" ;;
	*)
		echo "Unsupported validator operating system: $(uname -s)" >&2
		exit 1
		;;
esac

case "$(uname -m)" in
	arm64|aarch64)
		GOARCH="arm64"
		BINARY_ARCH="arm64"
		;;
	x86_64|amd64)
		GOARCH="amd64"
		BINARY_ARCH="amd64"
		;;
	*)
		echo "Unsupported validator architecture: $(uname -m)" >&2
		exit 1
		;;
esac

BIN_DIR="$SCRIPT_DIR/../ts-wrapper/bin"
RUNTIME_BIN_DIR="$SCRIPT_DIR/../ts-wrapper/dist/bin"
BINARY_PATH="$BIN_DIR/validator-$GOOS-$BINARY_ARCH"
VALIDATOR_GO_CACHE_DIR="${TMPDIR:-/tmp}/go-plans-validator-cache"

echo "Cleaning validator binary directories..."
rm -rf -- "$BIN_DIR" "$RUNTIME_BIN_DIR"
mkdir -p "$BIN_DIR" "$RUNTIME_BIN_DIR"
mkdir -p "$VALIDATOR_GO_CACHE_DIR"

echo "Building GTFS validator binary: $BINARY_PATH"
(
	cd "$SCRIPT_DIR/src"
	CGO_ENABLED=0 GOCACHE="$VALIDATOR_GO_CACHE_DIR" GOOS="$GOOS" GOARCH="$GOARCH" go build \
		-o "$BINARY_PATH" \
		.
)

chmod +x "$BINARY_PATH"
# The compiled TypeScript wrapper executes the binary from dist/bin.
cp -p "$BINARY_PATH" "$RUNTIME_BIN_DIR/"
echo "GTFS validator binary ready: $("$BINARY_PATH" -version)"
echo "Runtime binary updated: $RUNTIME_BIN_DIR/$(basename "$BINARY_PATH")"
echo
