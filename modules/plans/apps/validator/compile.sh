#!/bin/bash

# Version from first argument - write to version.go before build
VERSION="${1:-}"
if [ -n "$VERSION" ]; then
  echo "Building with version: $VERSION"
  echo 'package main

var version = "'"$VERSION"'"' > validator/version.go
else
  echo "WARNING: No version passed - binary will show v0.0.0"
  echo 'package main

var version = "0.0.0"' > validator/version.go
fi

# Check for folder bin and create it if it doesn't exist
if [ ! -d "bin" ]; then
    mkdir bin
fi

cd validator

# Compile the validator for linux (use . to include version.go)
CGO_ENABLED=0 GOOS=linux GOARCH=amd64 go build -o ../bin/validator-linux-amd64 .

# Compile the validator for linux arm64
CGO_ENABLED=0 GOOS=linux GOARCH=arm64 go build -o ../bin/validator-linux-arm64 .

# Compile the validator for darwin x86_64
CGO_ENABLED=0 GOOS=darwin GOARCH=amd64 go build -o ../bin/validator-darwin-amd64 .

# Compile the validator for darwin arm64
CGO_ENABLED=0 GOOS=darwin GOARCH=arm64 go build -o ../bin/validator-darwin-arm64 .

# Compile the validator for windows x86_64
CGO_ENABLED=0 GOOS=windows GOARCH=amd64 go build -o ../bin/validator.exe .

# Allow all users to execute the validator
chmod +x ../bin/validator-linux-amd64
chmod +x ../bin/validator-linux-arm64
chmod +x ../bin/validator-darwin-amd64
chmod +x ../bin/validator-darwin-arm64
chmod +x ../bin/validator.exe

# Check if the compilation was successful
if [ $? -ne 0 ]; then
    echo "Error: Failed to compile the validator"
    exit 1
fi

cd ..

# Make binaries executable (ignore windows if chmod fails)
chmod +x bin/validator-* || true

echo "Build completed successfully"