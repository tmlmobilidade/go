#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../../.." && pwd)"
GIT_REVISION="$(git -C "$REPO_ROOT" rev-parse --short=12 HEAD 2>/dev/null || echo unknown)"
DEFAULT_VERSION="local-$GIT_REVISION"

if [[ -n "$(git -C "$REPO_ROOT" status --porcelain 2>/dev/null)" ]]; then
	DEFAULT_VERSION="$DEFAULT_VERSION-dirty"
fi

VERSION="${1:-$DEFAULT_VERSION}"

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

BIN_DIR="$REPO_ROOT/bin"
BINARY_PATH="$BIN_DIR/validator-$GOOS-$BINARY_ARCH"
LEGACY_WRAPPER_BIN_DIR="$SCRIPT_DIR/ts-wrapper/bin"
LEGACY_WRAPPER_DIST_BIN_DIR="$SCRIPT_DIR/ts-wrapper/dist/bin"
VALIDATOR_GO_CACHE_DIR="${TMPDIR:-/tmp}/go-plans-validator-cache"

echo "Removing old local GTFS validator binaries"
rm -rf -- "$BIN_DIR" "$LEGACY_WRAPPER_BIN_DIR" "$LEGACY_WRAPPER_DIST_BIN_DIR"

mkdir -p "$BIN_DIR"
mkdir -p "$VALIDATOR_GO_CACHE_DIR"

echo "Building local GTFS validator: $BINARY_PATH"
(
	cd "$SCRIPT_DIR/validator"
	CGO_ENABLED=0 GOCACHE="$VALIDATOR_GO_CACHE_DIR" GOOS="$GOOS" GOARCH="$GOARCH" go build \
		-ldflags "-X main.version=$VERSION" \
		-o "$BINARY_PATH" \
		.
)

chmod +x "$BINARY_PATH"
echo "Local GTFS validator ready: $("$BINARY_PATH" -version)"
