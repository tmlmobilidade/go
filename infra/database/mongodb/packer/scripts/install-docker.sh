#!/usr/bin/env bash

# -----------------------------------------------------------------------
# install-docker.sh
# Packer provisioner: installs Docker Engine and adds ubuntu to docker group.
# -----------------------------------------------------------------------

set -euo pipefail

echo "[docker] Starting Docker Engine installation..."


while fuser /var/lib/apt/lists/lock >/dev/null 2>&1; do
	echo "[docker] Waiting for apt lock..."
	sleep 2
done


echo "[docker] Downloading Docker installation script..."
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh


echo "[docker] Running Docker installation script..."
sh /tmp/get-docker.sh


echo "[docker] Cleaning up installation script..."
rm /tmp/get-docker.sh


echo "[docker] Adding 'ubuntu' user to the docker group..."
usermod -aG docker ubuntu


echo "[docker] Docker install complete."
docker --version