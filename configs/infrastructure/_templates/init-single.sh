#!/bin/sh

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

echo "================================"
echo "   TML Single Instance Setup    "
echo "================================"

# Prompt for service name and port
read -p "Enter the service name: " SERVICE_NAME
read -p "Enter the port: " PORT
PORT=${PORT:-"27017"}

mkdir -p ../$SERVICE_NAME
cd ../$SERVICE_NAME

# Convert service name to uppercase for variable prefix
SERVICE_PREFIX=$(echo "$SERVICE_NAME" | tr '[:lower:]' '[:upper:]')

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Define allowed characters for passwords (only alphanumeric characters since MongoDB transforms special characters)
ALLOWED_CHARACTERS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz"

# Function to generate a random password of given length
generate_password() {
    local length=$1
    local password=""
    for i in $(seq 1 $length); do
        # Generate a random index based on the length of ALLOWED_CHARACTERS
        local index=$((RANDOM % ${#ALLOWED_CHARACTERS}))
        # Append the character at the random index to the password
        password="${password}${ALLOWED_CHARACTERS:$index:1}"
    done
    echo "$password"
}

# Generate random passwords with service-specific prefixes
ADMIN_PASSWORD=$(generate_password 30)
READ_PASSWORD=$(generate_password 30)
WRITE_PASSWORD=$(generate_password 30)

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Create the compose file
cat <<EOF > compose.yaml
name: ${SERVICE_NAME}

secrets:
  backupd_config:
    file: ./backupd.yaml

services:
  #

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #

  watchtower:
    image: containrrr/watchtower
    deploy:
      restart_policy:
        condition: on-failure
        delay: 30s
      resources:
        limits:
          memory: 100mb
    logging:
      options:
        max-size: '1m'
        max-file: '1'
    volumes:
      - /var/run/docker.sock:/var/run/docker.sock
    environment:
      - WATCHTOWER_POLL_INTERVAL=60
      - WATCHTOWER_CLEANUP=TRUE
      - WATCHTOWER_INCLUDE_STOPPED=TRUE
      - WATCHTOWER_REVIVE_STOPPED=TRUE
      - WATCHTOWER_ROLLING_RESTART=TRUE

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #

  ${SERVICE_NAME}-db:
    image: mongo:latest
    command: mongod --bind_ip_all --auth
    restart: always
    ports:
      - ${PORT}:27017
    volumes:
      - ./init-mongo.sh:/docker-entrypoint-initdb.d/init-mongo.sh
      - ./${SERVICE_NAME}-db-data:/data/db
    env_file:
      - .env

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #

  backupd:
    image: ghcr.io/tmlmobilidade/backupd:production
    secrets:
      - backupd_config
EOF

# Export dynamic environment variables
# export "${SERVICE_PREFIX}_SERVICE_NAME=$SERVICE_NAME"
# export "${SERVICE_PREFIX}_PORT=$PORT"
# export "${SERVICE_PREFIX}_ADMIN_USERNAME=admin"
# export "${SERVICE_PREFIX}_ADMIN_PASSWORD=$ADMIN_PASSWORD"
# export "${SERVICE_PREFIX}_READ_USERNAME=read"
# export "${SERVICE_PREFIX}_READ_PASSWORD=$READ_PASSWORD"
# export "${SERVICE_PREFIX}_WRITE_USERNAME=write"
# export "${SERVICE_PREFIX}_WRITE_PASSWORD=$WRITE_PASSWORD"

# echo "Environment variables set:"
# echo "  ${SERVICE_PREFIX}_ADMIN_USERNAME: admin"
# echo "  ${SERVICE_PREFIX}_ADMIN_PASSWORD: $ADMIN_PASSWORD"
# echo "  ${SERVICE_PREFIX}_READ_USERNAME: read"
# echo "  ${SERVICE_PREFIX}_READ_PASSWORD: $READ_PASSWORD"
# echo "  ${SERVICE_PREFIX}_WRITE_USERNAME: write"
# echo "  ${SERVICE_PREFIX}_WRITE_PASSWORD: $WRITE_PASSWORD"

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Generate init-mongo.sh file
cat <<EOF > init-mongo.sh
#!/bin/bash

mongosh <<EOF_MONGO
use admin

// Create the admin user
db.createUser({
	user: "admin",
	pwd: "\$ADMIN_PASSWORD",
	roles: ["root"]
})

// Create a read-only user
db.createUser({
	user: "read",
	pwd: "\$READ_PASSWORD",
	roles: [ { role: "read", db: "production" } ]
})

// Create a read-write user
db.createUser({
	user: "write",
	pwd: "\$WRITE_PASSWORD",
	roles: [ { role: "readWrite", db: "production" } ]
})
EOF_MONGO
EOF

# Make the init-mongo.sh file executable
chmod +x init-mongo.sh

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Generate .env file
cat <<EOF > .env
ADMIN_PASSWORD="$ADMIN_PASSWORD"
WRITE_PASSWORD="$WRITE_PASSWORD"
READ_PASSWORD="$READ_PASSWORD"
EOF

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

echo "Complete"

cd ..