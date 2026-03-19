#!/bin/bash
# setup-clickhouse.sh — Create ClickHouse data directory structure
#
# Usage: setup-clickhouse.sh <base_dir>
#
# Arguments:
#   base_dir - Root directory for ClickHouse data (e.g. /opt/clickhouse)
#
# Expected to run after attach-volume.sh has mounted the block volume.
# UID 101 is the clickhouse user inside the official clickhouse-server Docker image.
set -euo pipefail

BASE_DIR="${1:?Usage: setup-clickhouse.sh <base_dir>}"

mkdir -p "$BASE_DIR/clickhouse_data"
mkdir -p "$BASE_DIR/clickhouse_logs"
mkdir -p "$BASE_DIR/config.d"
mkdir -p "$BASE_DIR/users.d"
mkdir -p "$BASE_DIR/secrets"

chown -R 101:101 "$BASE_DIR/clickhouse_data"
chown -R 101:101 "$BASE_DIR/clickhouse_logs"
chown -R ubuntu:ubuntu "$BASE_DIR/config.d"
chown -R ubuntu:ubuntu "$BASE_DIR/users.d"
chown -R ubuntu:ubuntu "$BASE_DIR/secrets"

chmod -R 775 "$BASE_DIR"

cp /usr/local/share/clickhouse/compose.yaml "$BASE_DIR/compose.yml"
