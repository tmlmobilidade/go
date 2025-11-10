#!/bin/bash

# Environment Sync Script
# Syncs production environment data to staging
# Handles both OCI file storage and MongoDB database

set -e  # Exit on error
set -u  # Exit on undefined variable

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date +'%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1" >&2
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

# Configuration
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
SECRETS_DIR="${SCRIPT_DIR}/secrets"
BACKUP_DIR="${SCRIPT_DIR}/backups"
ENV_FILE="${SCRIPT_DIR}/env"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Check if env file exists
if [[ ! -f "${ENV_FILE}" ]]; then
    error "Environment file not found at ${ENV_FILE}"
    error "Please copy env.example to env and configure it"
    exit 1
fi

# Load environment configuration
source "${ENV_FILE}"

# Set default OCI paths if not in env
OCI_SOURCE="${OCI_SOURCE:-OCI - TML SAE:tmlmobilidade-sae-production/}"
OCI_DEST="${OCI_DEST:-OCI - TML SAE:tmlmobilidade-sae-staging/}"

# Set default rclone config path
RCLONE_CONFIG="${SECRETS_DIR}/rclone.conf"

# Function to generate rclone config from env variables
generate_rclone_config() {
    local config_file="${1}"
    
    # Validate required rclone variables
    if [[ -z "${RCLONE_REMOTE_NAME:-}" ]] || [[ -z "${RCLONE_TYPE:-}" ]] || \
       [[ -z "${RCLONE_COMPARTMENT:-}" ]] || [[ -z "${RCLONE_NAMESPACE:-}" ]] || \
       [[ -z "${RCLONE_REGION:-}" ]] || [[ -z "${RCLONE_CONFIG_FILE:-}" ]]; then
        error "Rclone configuration variables not set in ${ENV_FILE}"
        error "Required variables: RCLONE_REMOTE_NAME, RCLONE_TYPE, RCLONE_COMPARTMENT, RCLONE_NAMESPACE, RCLONE_REGION, RCLONE_CONFIG_FILE"
        return 1
    fi
    
    # Generate rclone config file
    cat > "${config_file}" << EOF
[${RCLONE_REMOTE_NAME}]
type = ${RCLONE_TYPE}
compartment = ${RCLONE_COMPARTMENT}
namespace = ${RCLONE_NAMESPACE}
region = ${RCLONE_REGION}
config_file = ${RCLONE_CONFIG_FILE}
EOF
    
    log "Generated rclone config at ${config_file}"
}

# Generate rclone config from env variables
generate_rclone_config "${RCLONE_CONFIG}" || exit 1

# Function to sync OCI files
sync_oci_files() {
    log "Starting OCI file sync..."
    
    # Source and destination OCI paths are set globally at the top of the script
    log "Source: ${OCI_SOURCE}"
    log "Destination: ${OCI_DEST}"
    
    # Create backup before sync
    local backup_timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_path="${BACKUP_DIR}/oci_files_${backup_timestamp}"
    
    # log "Creating backup of staging files..."
    # rclone copy "${OCI_DEST}" "${backup_path}" --config="${RCLONE_CONFIG}" || {
    #     warning "Could not backup staging files (may not exist yet)"
    # }
    
    # Sync production to staging
    log "Syncing files from production to staging..."
    rclone sync "${OCI_SOURCE}" "${OCI_DEST}" \
        --config="${RCLONE_CONFIG}" \
        --progress \
        --verbose
    
    if [[ $? -eq 0 ]]; then
        log "OCI file sync completed successfully"
    else
        error "OCI file sync failed"
        return 1
    fi
}

# Function to sync MongoDB database
sync_mongodb() {
    log "Starting MongoDB sync..."
    
    # MongoDB configuration loaded from mongo.conf
    if [[ -z "${PROD_HOST:-}" ]] || [[ -z "${STAGING_HOST:-}" ]]; then
        error "MongoDB hosts not configured in ${MONGO_CONFIG}"
        return 1
    fi
    
    # Check if mongodump and mongorestore are available
    if ! command -v mongodump &> /dev/null; then
        error "mongodump not found. Please install MongoDB tools."
        return 1
    fi
    
    if ! command -v mongorestore &> /dev/null; then
        error "mongorestore not found. Please install MongoDB tools."
        return 1
    fi
    
    # Create backup directory for MongoDB dump
    local backup_timestamp=$(date +'%Y%m%d_%H%M%S')
    local dump_path="${BACKUP_DIR}/mongodb_${backup_timestamp}"
    mkdir -p "${dump_path}"
    
    # Build mongodump command
    local dump_cmd="mongodump \
        --host=${PROD_HOST} \
        --username=${PROD_USERNAME} \
        --password=${PROD_PASSWORD} \
        --authenticationDatabase=${PROD_AUTH_DATABASE} \
        --db=${PROD_DB} \
        --gzip \
        --out=${dump_path}"
    
    # Add exclude collections if configured
    if [[ -n "${EXCLUDE_COLLECTIONS:-}" ]]; then
        for collection in ${EXCLUDE_COLLECTIONS}; do
            dump_cmd="${dump_cmd} --excludeCollection=${collection}"
        done
    fi
    
    # Dump production database
    log "Dumping production database..."
    eval ${dump_cmd}
    
    if [[ $? -ne 0 ]]; then
        error "Failed to dump production database"
        return 1
    fi
    
    # Drop staging database before restore
    log "Restoring to staging database..."
    mongorestore \
        --host=${STAGING_HOST} \
        --username=${STAGING_USERNAME} \
        --password=${STAGING_PASSWORD} \
        --authenticationDatabase=${STAGING_AUTH_DATABASE} \
        --db=${STAGING_DB} \
        --drop \
        --gzip \
        --numParallelCollections=4 \
        "${dump_path}"
    
    if [[ $? -eq 0 ]]; then
        log "MongoDB sync completed successfully"
    else
        error "MongoDB sync failed"
        return 1
    fi
}

# Function to sync MongoDB with replica set considerations
sync_mongodb_replica_set() {
    log "Starting MongoDB sync with replica set support..."
    
    # MongoDB configuration loaded from mongo.conf
    if [[ -z "${PROD_HOST:-}" ]] || [[ -z "${STAGING_HOST:-}" ]]; then
        error "MongoDB hosts not configured in ${MONGO_CONFIG}"
        return 1
    fi
    
    local backup_timestamp=$(date +'%Y%m%d_%H%M%S')
    local dump_path="${BACKUP_DIR}/mongodb_rs_${backup_timestamp}"
    mkdir -p "${dump_path}"
    
    # Build mongodump command with replica set
    local dump_cmd="mongodump \
        --host=${PROD_HOST} \
        --username=${PROD_USERNAME} \
        --password=${PROD_PASSWORD} \
        --authenticationDatabase=${PROD_AUTH_DATABASE} \
        --db=${PROD_DB} \
        --readPreference=primary \
        --gzip \
        --out=${dump_path}"
    
    # Add exclude collections if configured
    if [[ -n "${EXCLUDE_COLLECTIONS:-}" ]]; then
        for collection in ${EXCLUDE_COLLECTIONS}; do
            dump_cmd="${dump_cmd} --excludeCollection=${collection}"
        done
    fi
    
    # Dump from primary node in production replica set
    log "Dumping production database from replica set..."
    eval ${dump_cmd}
    
    if [[ $? -ne 0 ]]; then
        error "Failed to dump production database from replica set"
        return 1
    fi
    
    # Restore to staging replica set
    log "Restoring to staging replica set..."
    mongorestore \
        --host=${STAGING_HOST} \
        --username=${STAGING_USERNAME} \
        --password=${STAGING_PASSWORD} \
        --authenticationDatabase=${STAGING_AUTH_DATABASE} \
        --db=${STAGING_DB} \
        --drop \
        --gzip \
        --numParallelCollections=4 \
        "${dump_path}"
    
    if [[ $? -eq 0 ]]; then
        log "MongoDB replica set sync completed successfully"
    else
        error "MongoDB replica set sync failed"
        return 1
    fi
}

# Cleanup old backups (keep last 7 days)
cleanup_old_backups() {
    log "Cleaning up old backups (keeping last 7 days)..."
    find "${BACKUP_DIR}" -type d -mtime +7 -exec rm -rf {} + 2>/dev/null || true
    find "${BACKUP_DIR}" -type f -mtime +7 -delete 2>/dev/null || true
    log "Cleanup completed"
}

# Main function
main() {
    log "=========================================="
    log "Environment Sync: Production -> Staging"
    log "=========================================="
    
    # Parse command line arguments
    SYNC_FILES="${SYNC_FILES:-true}"
    SYNC_DB="${SYNC_DB:-true}"
    # USE_REPLICA_SET is loaded from mongo.conf, but can be overridden via command line
    
    # You can override defaults via environment variables or command line
    while [[ $# -gt 0 ]]; do
        case $1 in
            --files-only)
                SYNC_DB=false
                shift
                ;;
            --db-only)
                SYNC_FILES=false
                shift
                ;;
            --replica-set)
                USE_REPLICA_SET=true
                shift
                ;;
            --no-replica-set)
                USE_REPLICA_SET=false
                shift
                ;;
            --no-cleanup)
                NO_CLEANUP=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                echo "Usage: $0 [--files-only] [--db-only] [--replica-set] [--no-replica-set] [--no-cleanup]"
                exit 1
                ;;
        esac
    done
    
    # Sync files
    if [[ "${SYNC_FILES}" == "true" ]]; then
        sync_oci_files || {
            error "Failed to sync OCI files"
            exit 1
        }
    fi
    
    # Sync database
    if [[ "${SYNC_DB}" == "true" ]]; then
        if [[ "${USE_REPLICA_SET}" == "true" ]]; then
            sync_mongodb_replica_set || {
                error "Failed to sync MongoDB replica set"
                exit 1
            }
        else
            sync_mongodb || {
                error "Failed to sync MongoDB"
                exit 1
            }
        fi
    fi
    
    # Cleanup old backups
    if [[ "${NO_CLEANUP:-false}" != "true" ]]; then
        cleanup_old_backups
    fi
    
    log "=========================================="
    log "Environment sync completed successfully!"
    log "=========================================="
}

# Run main function
main "$@"

