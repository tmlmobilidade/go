#!/bin/sh

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

echo "================================"
echo "       TML Generate .env        "
echo "================================"

# Prompt for service name and port
read -p "Enter the service name: " SERVICE_NAME

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


# Generate .env file
cat <<EOF > .env
${SERVICE_PREFIX}_ADMIN_PASSWORD="$ADMIN_PASSWORD"
${SERVICE_PREFIX}_WRITE_PASSWORD="$WRITE_PASSWORD"
${SERVICE_PREFIX}_READ_PASSWORD="$READ_PASSWORD"
EOF

# # # # # # # # # # # # # # # # # # # # # # # # # # # #
# # # # # # # # # # # # # # # # # # # # # # # # # # # #

echo "Complete"

cd ..