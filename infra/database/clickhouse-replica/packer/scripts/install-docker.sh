#!/usr/bin/env bash
# -----------------------------------------------------------------------
# install-docker.sh
# Packer provisioner: installs Docker Engine and adds ubuntu to docker group.
# -----------------------------------------------------------------------
set -euo pipefail

echo "[docker] Installing Docker Engine..."
curl -fsSL https://get.docker.com -o /tmp/get-docker.sh
sh /tmp/get-docker.sh
rm /tmp/get-docker.sh

echo "[docker] Adding 'ubuntu' user to the docker group..."
usermod -aG docker ubuntu

echo "[docker] Enabling Docker service to start on boot..."
systemctl enable docker

echo "[docker] Docker install complete."
docker --version
