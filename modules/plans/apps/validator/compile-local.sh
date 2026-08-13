#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../../.." && pwd)"
VERSION="${1:-development}"

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

BINARY_PATH="$REPO_ROOT/bin/validator-$GOOS-$BINARY_ARCH"

mkdir -p "$REPO_ROOT/bin"

echo "Building local GTFS validator: $BINARY_PATH"
(
	cd "$SCRIPT_DIR/validator"
	CGO_ENABLED=0 GOOS="$GOOS" GOARCH="$GOARCH" go build \
		-ldflags "-X main.version=$VERSION" \
		-o "$BINARY_PATH" \
		.
)

chmod +x "$BINARY_PATH"
echo "Local GTFS validator ready"
