#!/usr/bin/env bash
set -euo pipefail

if [[ ! -f .devcontainer/packages.recommended.txt ]]; then
	echo "No recommended package list found at .devcontainer/packages.recommended.txt"
	exit 0
fi

echo "Installing recommended OS packages..."
sudo apt-get update
sudo xargs -r -a .devcontainer/packages.recommended.txt apt-get install -y --no-install-recommends
sudo rm -rf /var/lib/apt/lists/*

echo "Recommended package installation complete."
