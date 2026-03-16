#!/bin/bash

# attach-volume.sh — Detect and mount a block volume by size range
#
# Usage: attach-volume.sh <mount_point> <min_size_bytes> <max_size_bytes>
#
# Arguments:
#   mount_point    - Directory to mount the volume (e.g. /opt/mongodb)
#   min_size_bytes - Minimum disk size in bytes (default: 966367641600  ~900 GB)
#   max_size_bytes - Maximum disk size in bytes (default: 1181116006400 ~1.1 TB)

set -euo pipefail

MOUNT_POINT="${1:?Usage: attach-volume.sh <mount_point> [min_size_bytes] [max_size_bytes]}"
MIN_SIZE="${2:-966367641600}"
MAX_SIZE="${3:-1181116006400}"

DATA_DISK=""
ATTEMPT=0
while [ $ATTEMPT -lt 15 ]; do
  ATTEMPT=$((ATTEMPT + 1))
  echo "Scanning for data disk (attempt $ATTEMPT)..."
  ROOT_DISK=$(findmnt -n -o SOURCE / | sed 's/[0-9]*$//')
  for disk in $(lsblk -d -n -o NAME); do
    DEV="/dev/$disk"
    case "$DEV" in "$ROOT_DISK"*) continue ;; esac
    SIZE=$(lsblk -b -n -o SIZE "$DEV" 2>/dev/null || echo 0)
    if [ "$SIZE" -ge "$MIN_SIZE" ] && [ "$SIZE" -le "$MAX_SIZE" ]; then
      DATA_DISK="$DEV"
      echo "Found data disk at $DATA_DISK (size: $SIZE bytes)"
      break 2
    fi
  done
  sleep 2
done

if [ -n "$DATA_DISK" ]; then
  blkid "$DATA_DISK" || mkfs.xfs -L DATA "$DATA_DISK"
  mkdir -p "$MOUNT_POINT"
  mount "$DATA_DISK" "$MOUNT_POINT"
  if ! grep -q "$MOUNT_POINT" /etc/fstab; then
    echo "$DATA_DISK $MOUNT_POINT xfs defaults,noatime,_netdev 0 0" >> /etc/fstab
  fi
else
  echo "ERROR: Data disk not found after 15 attempts!"
  exit 1
fi
