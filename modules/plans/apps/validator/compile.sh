#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd -- "$SCRIPT_DIR" && pwd)"
BIN_DIR="$REPO_ROOT/bin"
cd "$SCRIPT_DIR"

mkdir -p "$BIN_DIR"

cd validator

# Compile the validator for linux (use . to include version.go)
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o "$BIN_DIR/validator-linux-amd64" .

# Compile the validator for linux arm64
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o "$BIN_DIR/validator-linux-arm64" .

# Compile the validator for darwin x86_64
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o "$BIN_DIR/validator-darwin-amd64" .

# Compile the validator for darwin arm64
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o "$BIN_DIR/validator-darwin-arm64" .

# Allow all users to execute the validator
chmod +x "$BIN_DIR/validator-linux-amd64"
chmod +x "$BIN_DIR/validator-linux-arm64"
chmod +x "$BIN_DIR/validator-darwin-amd64"
chmod +x "$BIN_DIR/validator-darwin-arm64"

echo "Build completed successfully"
