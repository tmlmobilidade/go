#!/usr/bin/env bash
set -euo pipefail

if [[ -f package-lock.json ]]; then
	echo "Installing npm dependencies with npm ci..."
	npm ci
else
	echo "No package-lock.json found, using npm install..."
	npm install
fi

if [[ -f .devcontainer/scripts/post-create.local.sh ]]; then
	echo "Running local post-create customizations..."
	bash .devcontainer/scripts/post-create.local.sh
fi

echo "Devcontainer setup complete."
