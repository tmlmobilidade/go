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

while [[ $# -gt 0 ]]; do
  case "$1" in
    --node-index) NODE_INDEX="$2"; shift 2 ;;
    --mongodb-port) PORT="$2"; shift 2 ;;
    --username) USERNAME="$2"; shift 2 ;;
    --password) PASSWORD="$2"; shift 2 ;;
    --replica-set-name) REPLICA_SET_NAME="$2"; shift 2 ;;
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

# Only primary initializes
if [[ "$NODE_INDEX" -ne 0 ]]; then
  echo "Node $NODE_INDEX: secondary node, skipping rs.initiate()"
  exit 0
fi

# ----------------------------
# Run mongosh
# ----------------------------
echo "Node 0: initiating replica set '$REPLICA_SET_NAME'..."

docker compose exec -T mongodb mongosh \
  -u "$MONGO_INITDB_ROOT_USERNAME" \
  -p "$MONGO_INITDB_ROOT_PASSWORD" \
  --authenticationDatabase admin <<EOF
	use admin;
	rs.initiate({
		_id: "$REPLICA_SET_NAME",
		members: [
			{ _id: 0, host: "go-mongodb-1.tmlmobilidade.pt:$PORT", priority: 1 },
			{ _id: 1, host: "go-mongodb-2.tmlmobilidade.pt:$PORT", priority: 0.5 },
			{ _id: 2, host: "go-mongodb-3.tmlmobilidade.pt:$PORT", priority: 0.5 }
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