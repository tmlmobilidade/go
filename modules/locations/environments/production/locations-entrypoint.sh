#!/bin/bash

echo "+----------------------------------------------+"
echo "|    Initializing MongoDB Entrypoint Script    |"
echo "+----------------------------------------------+"

mongosh <<EOF
use admin

// Initialize the replica set
rs.initiate()

// Wait for replica set initiation
while (!rs.isMaster().ismaster) {
	sleep(1000);
}

// Create the admin user
db.createUser({
	user: "admin",
	pwd: "$LOCATIONS_ADMIN_PASSWORD",
	roles: ["root"]
})

// Create a read-only user
db.createUser({
	user: "read",
	pwd: "$LOCATIONS_READ_PASSWORD",
	roles: [ { role: "read", db: "production" } ]
})

// Create a read-write user
db.createUser({
	user: "write",
	pwd: "$LOCATIONS_WRITE_PASSWORD",
	roles: [ { role: "readWrite", db: "production" } ]
})
EOF

echo "+----------------------------------------------+"
echo "|      MongoDB replica set initialized         |"
echo "+----------------------------------------------+"

mongorestore production --drop --gzip --archive=/dump/db.dump