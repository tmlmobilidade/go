#!/bin/bash
# setup-mongodb.sh — Create MongoDB data directory structure
#
# Usage: setup-mongodb.sh <base_dir>
#
# Arguments:
#   base_dir - Root directory for MongoDB data (e.g. /opt/mongodb)
#
# Expected to run after attach-volume.sh has mounted the block volume.
# UID 999 is the mongodb user inside the official mongo Docker image.
set -euo pipefail

BASE_DIR="${1:?Usage: setup-mongodb.sh <base_dir>}"

mkdir -p "$BASE_DIR/data"
mkdir -p "$BASE_DIR/logs"
mkdir -p "$BASE_DIR/keyfile"
mkdir -p "$BASE_DIR/secrets"

chown -R 999:999 "$BASE_DIR/data"
chown -R 999:999 "$BASE_DIR/logs"
chown -R 999:999 "$BASE_DIR/keyfile"
chown -R ubuntu:ubuntu "$BASE_DIR/secrets"

chmod -R 770 "$BASE_DIR/data"
chmod -R 770 "$BASE_DIR/logs"

cp /usr/local/share/mongodb/compose.yaml "$BASE_DIR/compose.yml"
