#!/usr/bin/env bash

set -euo pipefail

echo "================================================"
echo "Initializing MongoDB replica set"
echo "================================================"

# ----------------------------
# Parse named arguments
# ----------------------------
NODE_INDEX=""
PORT=""
USERNAME=""
PASSWORD=""
REPLICA_SET_NAME=""
ALL_IPS=""

while [[ $# -gt 0 ]]; do
  case "$1" in
    --node-index) NODE_INDEX="$2"; shift 2 ;;
    --mongodb-port) PORT="$2"; shift 2 ;;
    --username) USERNAME="$2"; shift 2 ;;
    --password) PASSWORD="$2"; shift 2 ;;
    --replica-set-name) REPLICA_SET_NAME="$2"; shift 2 ;;
    --all-private-ips) ALL_IPS="$2"; shift 2 ;;
    *)
      echo "Unknown argument: $1"
      exit 1
      ;;
  esac
done

# Validate required args
: "${NODE_INDEX:?Missing --node-index}"
: "${PORT:?Missing --mongodb-port}"
: "${USERNAME:?Missing --username}"
: "${PASSWORD:?Missing --password}"
: "${REPLICA_SET_NAME:?Missing --replica-set-name}"
: "${ALL_IPS:?Missing --all-private-ips}"

# Only primary initializes
if [[ "$NODE_INDEX" -ne 0 ]]; then
  echo "Node $NODE_INDEX: secondary node, skipping rs.initiate()"
  exit 0
fi

# ----------------------------
# Build members array (JS)
# ----------------------------
IFS=',' read -ra IPS <<< "$ALL_IPS"

MEMBERS_JS=""
IDX=0

for IP in "${IPS[@]}"; do
  PRIORITY=$( [[ "$IDX" -eq 0 ]] && echo 1 || echo 0.5 )

  MEMBERS_JS+="{ _id: $IDX, host: \"$IP:$PORT\", priority: $PRIORITY },"
  IDX=$((IDX + 1))
done

# Remove trailing comma
MEMBERS_JS="${MEMBERS_JS%,}"

# ----------------------------
# Run mongosh
# ----------------------------
echo "Node 0: initiating replica set '$REPLICA_SET_NAME'..."

docker compose exec -T mongodb mongosh \
  "mongodb://$USERNAME:$PASSWORD@localhost:$PORT/admin" <<EOF
rs.initiate({
  _id: "$REPLICA_SET_NAME",
  members: [
    $MEMBERS_JS
  ]
})

// Wait until primary is elected
while (!rs.isMaster().ismaster) {
  sleep(1000);
}
EOF

echo "================================================"
echo "Replica set initialization complete"
echo "================================================"