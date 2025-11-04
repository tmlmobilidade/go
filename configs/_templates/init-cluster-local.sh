#!/bin/sh

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                  PROMPT USER INPUT                  #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Title section
echo "\n"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "#             TML Sharding Instance Setup             #"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "\n"

# Prompt for service name and port
read -p "Enter the service name: " SERVICE_NAME

mkdir -p $SERVICE_NAME
cd $SERVICE_NAME

# Convert service name to uppercase for variable prefix
SERVICE_PREFIX=$(echo "$SERVICE_NAME" | tr '[:lower:]' '[:upper:]')

# Prompt for the number of shards (max 5)
while :; do
  read -p "Enter the number of shards (1-5): " NUM_SHARDS
  if [ "$NUM_SHARDS" -ge 1 ] && [ "$NUM_SHARDS" -le 5 ]; then
    break
  else
    echo "Please enter a valid number between 1 and 5."
  fi
done

# Prompt for the number of Read Replicas for each shard
while :; do
  read -p "Enter the number of Read Replicas for each shard (1-5): " NUM_READ_REPLICAS
  if [ "$NUM_READ_REPLICAS" -ge 1 ] && [ "$NUM_READ_REPLICAS" -le 5 ]; then
    break
  else
    echo "Please enter a valid number between 1 and 5."
  fi
done

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
#                  GENERATE USERS                     #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

# Define allowed characters for passwords (excluding !, ", #, $, /, and =)
ALLOWED_CHARACTERS="0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz&%"
ALPHABET_LOWER="abcdefghijklmnopqrstuvwxyz"

# Function to generate a random password of given length
# generate_password() {
#     local length=$1
#     local password=""
#     for i in $(seq 1 $length); do
#         local index=$((RANDOM % ${#ALLOWED_CHARACTERS}))
#         password="${password}${ALLOWED_CHARACTERS:$index:1}"
#     done
#     echo "$password"
# }

# # Generate random passwords with service-specific prefixes
# ADMIN_PASSWORD=$(generate_password 12)
# READ_PASSWORD=$(generate_password 12)
# WRITE_PASSWORD=$(generate_password 12)

echo "\n\n"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "#                GENERATE COMPOSE FILE                #"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "\n\n"

cat <<EOF > compose.yaml
name: tml-cluster-${SERVICE_NAME}

secrets:
  backupd_config:
    file: ./backupd.yaml

networks:
  tml-cluster-${SERVICE_NAME}:

volumes:
  router-${SERVICE_NAME}-prod-1-db:
  router-${SERVICE_NAME}-prod-1-config:

  config-${SERVICE_NAME}-prod-1-db:
  config-${SERVICE_NAME}-prod-1-config:

  config-${SERVICE_NAME}-prod-2-db:
  config-${SERVICE_NAME}-prod-2-config:

  config-${SERVICE_NAME}-prod-3-db:
  config-${SERVICE_NAME}-prod-3-config:
EOF

# Append shard volumes dynamically
for i in $(seq 1 $NUM_SHARDS); do
  for j in $(seq 1 $NUM_READ_REPLICAS); do
  cat <<EOF >> compose.yaml

  shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}-db:
  shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}-config:
EOF
  done
done

cat <<EOF >> compose.yaml

services:

  watchtower:
    image: containrrr/watchtower
    command: --interval 30 --scope ${SERVICE_NAME}
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
      - WATCHTOWER_POLL_INTERVAL=10
      - WATCHTOWER_CLEANUP=TRUE
      - WATCHTOWER_INCLUDE_STOPPED=TRUE
      - WATCHTOWER_REVIVE_STOPPED=TRUE
      - WATCHTOWER_ROLLING_RESTART=TRUE
    labels: ["com.centurylinklabs.watchtower.scope=${SERVICE_NAME}"]

  # TODO: FIX THIS
  # backupd:
  #   image: ghcr.io/tmlmobilidade/backupd:production
  #   secrets:
  #     - backupd_config

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #

  router-${SERVICE_NAME}-prod-1:
    image: mongo:latest
    container_name: router-${SERVICE_NAME}-prod-1
    command: mongos --port 27017 --configdb rs-config-server/config-${SERVICE_NAME}-prod-1:27017,config-${SERVICE_NAME}-prod-2:27017,config-${SERVICE_NAME}-prod-3:27017 --bind_ip_all
    ports:
      - "27117:27017"
    restart: always
    volumes:
      - ./scripts:/scripts
      - router-${SERVICE_NAME}-prod-1-db:/data/db
      - router-${SERVICE_NAME}-prod-1-config:/data/configdb
    networks:
      - tml-cluster-${SERVICE_NAME}

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #
EOF
  for i in $(seq 1 3); do
    cat <<EOF >> compose.yaml
  config-${SERVICE_NAME}-prod-${i}:
    image: mongo:latest
    container_name: config-${SERVICE_NAME}-prod-${i}
    command: mongod --port 27017 --configsvr --replSet rs-config-server
    volumes:
      - ./scripts:/scripts
      - config-${SERVICE_NAME}-prod-${i}-db:/data/db
      - config-${SERVICE_NAME}-prod-${i}-config:/data/configdb
    restart: always
    networks:
      - tml-cluster-${SERVICE_NAME}
EOF
done

cat <<EOF >> compose.yaml

  # # # # # # # # # # # # # # # # # # # # #
  # # # # # # # # # # # # # # # # # # # # #

EOF

# Append shard services dynamically
for i in $(seq 1 $NUM_SHARDS); do
  for j in $(seq 1 $NUM_READ_REPLICAS); do
    cat <<EOF >> compose.yaml
  shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}:
    image: mongo:latest
    container_name: shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}
    command: mongod --port 27017 --shardsvr --replSet rs-shard-${i}
    volumes:
      - ./scripts:/scripts
      - shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}-db:/data/db
      - shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}-config:/data/configdb
    restart: always
    networks:
      - tml-cluster-${SERVICE_NAME}
EOF
  done
done

echo "\n\n"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "#                 GENERATE SCRIPTS                    #"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "\n\n"

mkdir -p scripts

# # # # # Generate init-shard files # # # # #
for i in $(seq 1 $NUM_SHARDS); do
  echo "Generating init-shard-${i}.js file..."
  cat <<EOF > scripts/init-shard-${i}.js
  rs.initiate({
	_id: 'rs-shard-${i}',
	version: 1,
	members: [
EOF
  for j in $(seq 1 $NUM_READ_REPLICAS); do
    cat <<EOF >> scripts/init-shard-${i}.js
      { _id: ${j}, host : "shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}:27017" },
EOF
  done
  cat <<EOF >> scripts/init-shard-${i}.js
	],
});
EOF
done

echo "Generating init-config-server.js file..."

cat <<EOF > scripts/init-config-server.js
rs.initiate({
	_id: 'rs-config-server',
	configsvr: true,
	version: 1,
	members: [
		{ _id: 0, host: 'config-${SERVICE_NAME}-prod-1:27017' },
		{ _id: 1, host: 'config-${SERVICE_NAME}-prod-2:27017' },
		{ _id: 2, host: 'config-${SERVICE_NAME}-prod-3:27017' },
	],
});
EOF

# # # # # Generate init-router.js file # # # # #
echo "Generating init-router.js file..."

for i in $(seq 1 $NUM_SHARDS); do
  for j in $(seq 1 $NUM_READ_REPLICAS); do
    echo "sh.addShard(\"rs-shard-${i}/shard-${SERVICE_NAME}-${i}-${ALPHABET_LOWER:$((j-1)):1}:27017\");" >> scripts/init-router.js
  done
done

# TODO: FIX USER CREATION
echo "sh.enableSharding(\"production\");" >> scripts/init-router.js
# cat <<EOF >> scripts/init-router.js
# sh.enableSharding("production");


# // Create a read-only user
# db.createUser({
#   user: "read",
#   pwd: "${READ_PASSWORD}",
#   roles: [ { role: "read", db: "production" } ]
# })

# // Create a read-write user
# db.createUser({
#   user: "write",
#   pwd: "${WRITE_PASSWORD}",
#   roles: [ { role: "readWrite", db: "production" } ]
# })
# EOF

echo "\n\n"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "#                  Setup Environment                  #"
echo "# # # # # # # # # # # # # # # # # # # # # # # # # # # #"
echo "\n\n"

# docker-compose up -d

# Wait for the docker containers to initialize
for seconds in {10..1}; do
  printf "\rWaiting %d seconds for the docker containers to initialize..." "$seconds"
  sleep 1
done
printf "\n"

# # Initialize the config server
# docker-compose exec config-${SERVICE_NAME}-prod-1 sh -c "mongosh < /scripts/init-config-server.js"

# # Initialize the shards
# for i in $(seq 1 $NUM_SHARDS); do
#   docker-compose exec shard-${SERVICE_NAME}-${i}-a sh -c "mongosh < /scripts/init-shard-${i}.js"
# done

# # Wait for the shards to initialize
# for seconds in {20..1}; do
#   printf "\rWaiting %d seconds for the shards to initialize..." "$seconds"
#   sleep 1
# done
# printf "\n"

# # Initialize the router
# docker-compose exec router-${SERVICE_NAME}-prod-1 sh -c "mongosh < /scripts/init-router.js"

# echo "\n\n"

# # Export dynamic environment variables
# export "${SERVICE_PREFIX}_SERVICE_NAME=$SERVICE_NAME"
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

cd ..