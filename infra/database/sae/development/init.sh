#!/bin/bash

echo "+----------------------------------------------+"
echo "|    Initializing MongoDB Entrypoint Script    |"
echo "+----------------------------------------------+"

mongosh <<EOF
use admin;

// Initialize the replica set
rs.initiate();

// Wait for replica set initiation
while (!rs.isMaster().ismaster) {
	sleep(1000);
}

// Create the root user
db.createUser({
	user: "root",
	pwd: "root",
	roles: ["root"]
});
EOF

mongorestore production --drop --gzip --archive=/dump/db.dump

echo "+----------------------------------------------+"
echo "|      MongoDB replica set initialized         |"
echo "+----------------------------------------------+"