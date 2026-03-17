#!/usr/bin/env bash

set -euo pipefail

# # #
# SETTINGS

# This is the persistent-data directory where MongoDB
# files and data will be stored. It is expected to be mounted
# as a block volume at /opt/persistent-data by attach-volume.sh.
BASE_DIR="/opt/persistent-data"


# 1.
# Create the directory structure for
# MongoDB data, logs, keyfiles, secrets
# and set appropriate ownership and permissions.

mkdir -p "$BASE_DIR/data"
mkdir -p "$BASE_DIR/logs"
mkdir -p "$BASE_DIR/keyfile"

chown -R 999:999 "$BASE_DIR/data"
chown -R 999:999 "$BASE_DIR/logs"
chown -R 999:999 "$BASE_DIR/keyfile"

chmod -R 770 "$BASE_DIR/data"
chmod -R 770 "$BASE_DIR/logs"
chmod -R 700 "$BASE_DIR/keyfile"