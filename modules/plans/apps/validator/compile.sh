#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR/../../../.." && pwd)"
BIN_DIR="$REPO_ROOT/bin"
cd "$SCRIPT_DIR"

# Version from first argument, injected through the linker without changing source files.
VERSION="${1:-0.0.0}"
echo "Building with version: $VERSION"
LDFLAGS="-X main.version=$VERSION"

mkdir -p "$BIN_DIR"

cd validator

# Compile the validator for linux (use . to include version.go)
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$BIN_DIR/validator-linux-amd64" .

# Compile the validator for linux arm64
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags "$LDFLAGS" -o "$BIN_DIR/validator-linux-arm64" .

# Compile the validator for darwin x86_64
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$BIN_DIR/validator-darwin-amd64" .

# Compile the validator for darwin arm64
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o "$BIN_DIR/validator-darwin-arm64" .

# Compile the validator for windows x86_64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o "$BIN_DIR/validator.exe" .

# Allow all users to execute the validator
chmod +x "$BIN_DIR/validator-linux-amd64"
chmod +x "$BIN_DIR/validator-linux-arm64"
chmod +x "$BIN_DIR/validator-darwin-amd64"
chmod +x "$BIN_DIR/validator-darwin-arm64"
chmod +x "$BIN_DIR/validator.exe"

echo "Build completed successfully"
