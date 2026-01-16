#!/bin/bash

echo "================================================"
echo "Initializing replica set"
echo "================================================"

PRIMARY_HOST="sae-db-rs0-1-production.carrismetropolitana.pt"
SECONDARY_HOST1="sae-db-rs0-2-production.carrismetropolitana.pt"
SECONDARY_HOST2="sae-db-rs0-3-production.carrismetropolitana.pt"

mongosh mongodb://$MONGO_INITDB_ROOT_USERNAME:$MONGO_INITDB_ROOT_PASSWORD@database:27017 <<EOF
use admin

// Initialize the replica set
rs.initiate({
	_id: "rs0",
	members: [
		{ _id: 0, host: "$PRIMARY_HOST:27017", priority: 1 },
		{ _id: 1, host: "$SECONDARY_HOST1:27017", priority: 0.5 },
		{ _id: 2, host: "$SECONDARY_HOST2:27017", priority: 0.5 },
	]
})

// Wait for replica set initiation
while (!rs.isMaster().ismaster) {
	sleep(1000);
}
EOF

echo "================================================"
echo "Restarting mongosh"
echo "================================================"