#!/bin/bash
# init-mongodb-replica-set.sh — Initialize MongoDB replica set (primary node only)
#
# Usage: init-mongodb-replica-set.sh <node_index> <port> <username> <password> <replica_set_name> <all_private_ips>
#
# Arguments:
#   node_index       - 0-based index of this node (only node 0 runs rs.initiate())
#   port             - MongoDB port
#   username         - MongoDB root username
#   password         - MongoDB root password
#   replica_set_name - Name of the replica set
#   all_private_ips  - Comma-separated list of all node private IPs
set -euo pipefail

NODE_INDEX="${1:?Usage: init-mongodb-replica-set.sh <node_index> <port> <username> <password> <replica_set_name> <all_private_ips>}"
PORT="$2"
USERNAME="$3"
PASSWORD="$4"
REPLICA_SET_NAME="$5"
ALL_IPS="$6"

if [ "$NODE_INDEX" -ne 0 ]; then
  echo "Node $NODE_INDEX: secondary node, replica set will be joined automatically."
  exit 0
fi

echo "Node 0: waiting for mongod to be ready..."
RETRY=0
READY=0
while [ $RETRY -lt 30 ]; do
  RETRY=$((RETRY + 1))
  if docker exec mongodb mongosh \
      --host localhost \
      --port "$PORT" \
      --username "$USERNAME" \
      --password "$PASSWORD" \
      --authenticationDatabase admin \
      --quiet \
      --eval "db.runCommand({ ping: 1 })" 2>/dev/null | grep -q 'ok.*1'; then
    echo "mongod is ready."
    READY=1
    break
  fi
  echo "Attempt $RETRY: mongod not ready yet, waiting 10s..."
  sleep 10
done

if [ "$READY" -eq 0 ]; then
  echo "ERROR: mongod did not become ready after 30 attempts."
  exit 1
fi

# Build members array from comma-separated IPs
MEMBERS=""
IDX=0
IFS=',' read -ra IPS <<< "$ALL_IPS"
for IP in "${IPS[@]}"; do
  PRIORITY=$([ "$IDX" -eq 0 ] && echo 2 || echo 1)
  [ -n "$MEMBERS" ] && MEMBERS="$MEMBERS,"
  MEMBERS="$MEMBERS{ _id: $IDX, host: \"$IP:$PORT\", priority: $PRIORITY }"
  IDX=$((IDX + 1))
done

echo "Node 0: initiating replica set $REPLICA_SET_NAME..."
INIT_RETRY=0
while [ $INIT_RETRY -lt 20 ]; do
  INIT_RETRY=$((INIT_RETRY + 1))
  OUTPUT=$(docker exec mongodb mongosh \
    --host localhost \
    --port "$PORT" \
    --username "$USERNAME" \
    --password "$PASSWORD" \
    --authenticationDatabase admin \
    --quiet \
    --eval "rs.initiate({ _id: \"$REPLICA_SET_NAME\", members: [ $MEMBERS ] });" 2>&1)
  if echo "$OUTPUT" | grep -qE 'ok\s*:\s*1'; then
    echo "Node 0: rs.initiate() succeeded."
    break
  fi
  echo "Attempt $INIT_RETRY: rs.initiate() failed, retrying in 15s... ($OUTPUT)"
  sleep 15
done
