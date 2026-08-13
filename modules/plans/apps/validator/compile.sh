#!/usr/bin/env bash

set -euo pipefail

SCRIPT_DIR="$(cd -- "$(dirname -- "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

# Version from first argument, injected through the linker without changing source files.
VERSION="${1:-0.0.0}"
echo "Building with version: $VERSION"
LDFLAGS="-X main.version=$VERSION"

# Check for folder bin and create it if it doesn't exist
if [ ! -d "bin" ]; then
    mkdir bin
fi

cd validator

# Compile the validator for linux (use . to include version.go)
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -ldflags "$LDFLAGS" -o ../bin/validator-linux-amd64 .

# Compile the validator for linux arm64
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -ldflags "$LDFLAGS" -o ../bin/validator-linux-arm64 .

# Compile the validator for darwin x86_64
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -ldflags "$LDFLAGS" -o ../bin/validator-darwin-amd64 .

# Compile the validator for darwin arm64
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -ldflags "$LDFLAGS" -o ../bin/validator-darwin-arm64 .

# Compile the validator for windows x86_64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -ldflags "$LDFLAGS" -o ../bin/validator.exe .

# Allow all users to execute the validator
chmod +x ../bin/validator-linux-amd64
chmod +x ../bin/validator-linux-arm64
chmod +x ../bin/validator-darwin-amd64
chmod +x ../bin/validator-darwin-arm64
chmod +x ../bin/validator.exe

cd ..

# Make binaries executable (ignore windows if chmod fails)
chmod +x bin/validator-* || true

echo "Build completed successfully"
