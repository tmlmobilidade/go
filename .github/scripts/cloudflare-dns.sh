#!/bin/bash
# Cloudflare DNS automation script for preview environments

set -e

CLOUDFLARE_API_TOKEN="${CLOUDFLARE_API_TOKEN}"
CLOUDFLARE_ZONE_ID="${CLOUDFLARE_ZONE_ID}"
SUBDOMAIN="${1}"
DOMAIN="${2}"
IP_ADDRESS="${3}"
ACTION="${4:-create}"  # create, update, delete

if [ -z "$CLOUDFLARE_API_TOKEN" ] || [ -z "$CLOUDFLARE_ZONE_ID" ]; then
  echo "Error: CLOUDFLARE_API_TOKEN and CLOUDFLARE_ZONE_ID must be set"
  exit 1
fi

FULL_DOMAIN="${SUBDOMAIN}.${DOMAIN}"

case "$ACTION" in
  create|update)
    if [ -z "$IP_ADDRESS" ]; then
      echo "Error: IP_ADDRESS required for create/update"
      exit 1
    fi
    
    # Check if record exists
    RECORD_ID=$(curl -s -X GET \
      "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?type=A&name=${FULL_DOMAIN}" \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" | jq -r '.result[0].id // empty')
    
    if [ -n "$RECORD_ID" ] && [ "$RECORD_ID" != "null" ]; then
      # Update existing record
      echo "Updating DNS record: ${FULL_DOMAIN}"
      RESPONSE=$(curl -s -X PUT \
        "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"${SUBDOMAIN}\",\"content\":\"${IP_ADDRESS}\",\"ttl\":300,\"comment\":\"Preview environment - Auto-managed\"}")
      
      SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
      if [ "$SUCCESS" != "true" ]; then
        echo "Error updating DNS record: $RESPONSE"
        exit 1
      fi
    else
      # Create new record
      echo "Creating DNS record: ${FULL_DOMAIN}"
      RESPONSE=$(curl -s -X POST \
        "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records" \
        -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
        -H "Content-Type: application/json" \
        --data "{\"type\":\"A\",\"name\":\"${SUBDOMAIN}\",\"content\":\"${IP_ADDRESS}\",\"ttl\":300,\"comment\":\"Preview environment - Auto-managed\"}")
      
      SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
      if [ "$SUCCESS" != "true" ]; then
        echo "Error creating DNS record: $RESPONSE"
        exit 1
      fi
    fi
    ;;
    
  delete)
    # Find all records matching the subdomain pattern
    echo "Deleting DNS records for: ${SUBDOMAIN}"
    RECORDS=$(curl -s -X GET \
      "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records?name=${FULL_DOMAIN}" \
      -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
      -H "Content-Type: application/json" | jq -r '.result[] | .id')
    
    if [ -z "$RECORDS" ]; then
      echo "No DNS records found for ${FULL_DOMAIN}"
      exit 0
    fi
    
    echo "$RECORDS" | while read -r RECORD_ID; do
      if [ -n "$RECORD_ID" ] && [ "$RECORD_ID" != "null" ]; then
        echo "Deleting DNS record ID: ${RECORD_ID}"
        RESPONSE=$(curl -s -X DELETE \
          "https://api.cloudflare.com/client/v4/zones/${CLOUDFLARE_ZONE_ID}/dns_records/${RECORD_ID}" \
          -H "Authorization: Bearer ${CLOUDFLARE_API_TOKEN}" \
          -H "Content-Type: application/json")
        
        SUCCESS=$(echo "$RESPONSE" | jq -r '.success')
        if [ "$SUCCESS" != "true" ]; then
          echo "Warning: Failed to delete record ${RECORD_ID}: $RESPONSE"
        fi
      fi
    done
    ;;
    
  *)
    echo "Error: Invalid action. Use 'create', 'update', or 'delete'"
    exit 1
    ;;
esac

echo "DNS operation completed successfully"