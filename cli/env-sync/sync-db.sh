#!/bin/bash

# Database Sync Script
# Syncs production MongoDB database to staging
#
# MongoDB Backup Strategy:
# - First backup: Full database dump with all collections
# - Subsequent backups: Incremental backups using oplog (oplog-only dumps)
# - Incremental backups require oplog availability (replica sets or standalone with oplog)
# - Use --full-backup flag to force a full backup instead of incremental

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
BACKUP_DIR="${SCRIPT_DIR}/backups"
ENV_FILE="${SCRIPT_DIR}/.env"
METADATA_FILE="${BACKUP_DIR}/.backup_metadata"

# Ensure backup directory exists
mkdir -p "${BACKUP_DIR}"

# Check if env file exists
if [[ ! -f "${ENV_FILE}" ]]; then
    error "Environment file not found at ${ENV_FILE}"
    error "Please copy env.example to .env and configure it"
    exit 1
fi

# Load environment configuration
source "${ENV_FILE}"

# Validate required MongoDB variables
if [[ -z "${PROD_HOST:-}" ]] || [[ -z "${STAGING_HOST:-}" ]]; then
    error "MongoDB hosts not configured in ${ENV_FILE}"
    error "Required variables: PROD_HOST, STAGING_HOST"
    exit 1
fi

# Function to save backup metadata
save_backup_metadata() {
    local backup_type=$1
    local timestamp=$2
    local oplog_ts=${3:-}
    
    local metadata_key="${backup_type}_last_backup"
    local metadata_line="${metadata_key}=${timestamp}"
    
    if [[ -n "${oplog_ts}" ]]; then
        metadata_line="${metadata_line}|oplog=${oplog_ts}"
    fi
    
    # Remove old entry if exists and add new one
    if [[ -f "${METADATA_FILE}" ]]; then
        grep -v "^${metadata_key}=" "${METADATA_FILE}" > "${METADATA_FILE}.tmp" || true
        mv "${METADATA_FILE}.tmp" "${METADATA_FILE}"
    fi
    
    echo "${metadata_line}" >> "${METADATA_FILE}"
}

# Function to load backup metadata
load_backup_metadata() {
    local backup_type=$1
    
    if [[ ! -f "${METADATA_FILE}" ]]; then
        return 1
    fi
    
    local metadata_key="${backup_type}_last_backup"
    local metadata_line=$(grep "^${metadata_key}=" "${METADATA_FILE}" | tail -1)
    
    if [[ -z "${metadata_line}" ]]; then
        return 1
    fi
    
    # Extract timestamp and oplog if present
    local timestamp=$(echo "${metadata_line}" | cut -d'=' -f2 | cut -d'|' -f1)
    local oplog_ts=""
    if echo "${metadata_line}" | grep -q "oplog="; then
        oplog_ts=$(echo "${metadata_line}" | sed 's/.*oplog=\([^|]*\).*/\1/')
    fi
    
    echo "${timestamp}|${oplog_ts}"
}

# Function to get oplog timestamp from MongoDB (for replica sets)
get_oplog_timestamp() {
    local host=$1
    local username=$2
    local password=$3
    local auth_db=$4
    
    # Use mongo shell or mongosh to get the latest oplog timestamp
    if command -v mongosh &> /dev/null; then
        local mongo_cmd="mongosh"
    elif command -v mongo &> /dev/null; then
        local mongo_cmd="mongo"
    else
        warning "Neither mongosh nor mongo found. Cannot get oplog timestamp."
        return 1
    fi
    
    local connection_string="mongodb://${username}:${password}@${host}/${auth_db}?authSource=${auth_db}"
    
    # Get the latest oplog entry timestamp
    local oplog_ts=$(${mongo_cmd} "${connection_string}" --quiet --eval \
        "db.getSiblingDB('local').oplog.rs.find().sort({ts: -1}).limit(1).forEach(function(doc) { print(doc.ts); })" 2>/dev/null)
    
    if [[ -n "${oplog_ts}" ]] && [[ "${oplog_ts}" != "null" ]]; then
        echo "${oplog_ts}"
        return 0
    fi
    
    return 1
}

# Function to sync MongoDB database
sync_mongodb() {
    log "Starting MongoDB sync..."
    
    # MongoDB configuration loaded from .env file
    if [[ -z "${PROD_HOST:-}" ]] || [[ -z "${STAGING_HOST:-}" ]]; then
        error "MongoDB hosts not configured in ${ENV_FILE}"
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
    
    # Check if this is an incremental backup
    local is_incremental=false
    local last_backup_metadata=""
    local use_oplog=false
    
    if [[ "${FORCE_FULL_BACKUP:-false}" != "true" ]]; then
        last_backup_metadata=$(load_backup_metadata "mongodb")
        if [[ $? -eq 0 ]] && [[ -n "${last_backup_metadata}" ]]; then
            is_incremental=true
            log "Previous backup found. Attempting incremental backup..."
            
            # Try to use oplog for incremental backup (works even for standalone if oplog exists)
            local oplog_ts=$(get_oplog_timestamp "${PROD_HOST}" "${PROD_USERNAME}" "${PROD_PASSWORD}" "${PROD_AUTH_DATABASE}")
            if [[ $? -eq 0 ]] && [[ -n "${oplog_ts}" ]]; then
                use_oplog=true
                log "Using oplog for incremental backup"
            else
                warning "Oplog not available. Performing full backup instead."
                is_incremental=false
            fi
        else
            log "No previous backup found. Performing full backup."
        fi
    else
        log "Force full backup requested. Performing full backup."
    fi
    
    # Create backup directory for MongoDB dump
    local backup_timestamp=$(date +'%Y%m%d_%H%M%S')
    local backup_type="mongodb"
    if [[ "${is_incremental}" == "true" ]]; then
        backup_type="mongodb_incr"
        dump_path="${BACKUP_DIR}/mongodb_incr_${backup_timestamp}"
    else
        dump_path="${BACKUP_DIR}/mongodb_${backup_timestamp}"
    fi
    mkdir -p "${dump_path}"
    
    # Build mongodump command
    local dump_cmd=""
    if [[ "${use_oplog}" == "true" ]]; then
        # For incremental backups, dump only the oplog collection
        # mongorestore --oplogReplay will apply oplog entries to update the database
        log "Dumping oplog for incremental backup..."
        dump_cmd="mongodump \
            --host=${PROD_HOST} \
            --username=${PROD_USERNAME} \
            --password=${PROD_PASSWORD} \
            --authenticationDatabase=${PROD_AUTH_DATABASE} \
            --db=local \
            --collection=oplog.rs \
            --gzip \
            --out=${dump_path}"
    else
        # For full backups, dump all collections
        dump_cmd="mongodump \
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
    fi
    
    # Dump production database
    if [[ "${is_incremental}" == "true" ]]; then
        log "Dumping incremental changes from production database..."
    else
        log "Dumping production database..."
    fi
    eval ${dump_cmd}
    
    if [[ $? -ne 0 ]]; then
        error "Failed to dump production database"
        return 1
    fi
    
    # Get oplog timestamp for metadata
    local current_oplog_ts=""
    local oplog_file=""
    if [[ "${use_oplog}" == "true" ]]; then
        current_oplog_ts=$(get_oplog_timestamp "${PROD_HOST}" "${PROD_USERNAME}" "${PROD_PASSWORD}" "${PROD_AUTH_DATABASE}")
        
        # Copy oplog.rs.bson to oplog.bson for mongorestore --oplogReplay
        # mongorestore expects oplog.bson in the dump directory root
        local oplog_rs_file="${dump_path}/local/oplog.rs.bson.gz"
        oplog_file="${dump_path}/oplog.bson.gz"
        if [[ -f "${oplog_rs_file}" ]]; then
            cp "${oplog_rs_file}" "${oplog_file}" || {
                error "Could not copy oplog file for replay"
                return 1
            }
            log "Oplog file prepared for replay: ${oplog_file}"
        else
            error "Oplog file not found at ${oplog_rs_file}"
            return 1
        fi
    fi
    
    # Restore to staging database
    local restore_exit_code=0
    if [[ "${is_incremental}" == "true" ]] && [[ "${use_oplog}" == "true" ]]; then
        log "Restoring incremental changes to staging database..."
        # Verify oplog file exists before restore
        if [[ ! -f "${oplog_file}" ]]; then
            error "Oplog file not found: ${oplog_file}"
            return 1
        fi
        
        # For incremental restore with oplog-only, use --oplogReplay
        # mongorestore --oplogReplay automatically looks for oplog.bson.gz in the dump root
        # The oplog entries contain database names, so mongorestore will apply them to the correct databases
        mongorestore \
            --host=${STAGING_HOST} \
            --username=${STAGING_USERNAME} \
            --password=${STAGING_PASSWORD} \
            --authenticationDatabase=${STAGING_AUTH_DATABASE} \
            --oplogReplay \
            --gzip \
            "${dump_path}" 2>&1
        
        restore_exit_code=$?
        
        if [[ ${restore_exit_code} -ne 0 ]]; then
            error "Failed to restore incremental changes. Exit code: ${restore_exit_code}"
            error "Note: Incremental restore requires the staging database to exist from a previous full backup."
            return 1
        fi
    else
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
            "${dump_path}" 2>&1
        
        restore_exit_code=$?
    fi
    
    if [[ ${restore_exit_code} -eq 0 ]]; then
        # Save backup metadata
        save_backup_metadata "mongodb" "${backup_timestamp}" "${current_oplog_ts}"
        
        if [[ "${is_incremental}" == "true" ]]; then
            log "MongoDB incremental sync completed successfully"
        else
            log "MongoDB sync completed successfully"
        fi
    else
        error "MongoDB sync failed"
        return 1
    fi
}

# Function to sync MongoDB with replica set considerations
sync_mongodb_replica_set() {
    log "Starting MongoDB sync with replica set support..."
    
    # MongoDB configuration loaded from .env file
    if [[ -z "${PROD_HOST:-}" ]] || [[ -z "${STAGING_HOST:-}" ]]; then
        error "MongoDB hosts not configured in ${ENV_FILE}"
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
    
    # Check if this is an incremental backup
    local is_incremental=false
    local last_backup_metadata=""
    
    if [[ "${FORCE_FULL_BACKUP:-false}" != "true" ]]; then
        last_backup_metadata=$(load_backup_metadata "mongodb_rs")
        if [[ $? -eq 0 ]] && [[ -n "${last_backup_metadata}" ]]; then
            is_incremental=true
            log "Previous backup found. Performing incremental backup using oplog..."
        else
            log "No previous backup found. Performing full backup."
        fi
    else
        log "Force full backup requested. Performing full backup."
    fi
    
    # Create backup directory for MongoDB dump
    local backup_timestamp=$(date +'%Y%m%d_%H%M%S')
    local dump_path=""
    if [[ "${is_incremental}" == "true" ]]; then
        dump_path="${BACKUP_DIR}/mongodb_rs_incr_${backup_timestamp}"
    else
        dump_path="${BACKUP_DIR}/mongodb_rs_${backup_timestamp}"
    fi
    mkdir -p "${dump_path}"
    
    # Build mongodump command with replica set
    local dump_cmd=""
    if [[ "${is_incremental}" == "true" ]]; then
        # For incremental backups, dump only the oplog collection
        # mongorestore --oplogReplay will apply oplog entries to update the database
        log "Dumping oplog for incremental backup..."
        dump_cmd="mongodump \
            --host=${PROD_HOST} \
            --username=${PROD_USERNAME} \
            --password=${PROD_PASSWORD} \
            --authenticationDatabase=${PROD_AUTH_DATABASE} \
            --db=local \
            --collection=oplog.rs \
            --readPreference=primary \
            --gzip \
            --out=${dump_path}"
    else
        # For full backups, dump all collections
        dump_cmd="mongodump \
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
    fi
    
    # Dump from primary node in production replica set
    if [[ "${is_incremental}" == "true" ]]; then
        log "Dumping incremental changes from production replica set..."
    else
        log "Dumping production database from replica set..."
    fi
    eval ${dump_cmd}
    
    if [[ $? -ne 0 ]]; then
        error "Failed to dump production database from replica set"
        return 1
    fi
    
    # Get oplog timestamp for metadata
    local current_oplog_ts=""
    local oplog_file=""
    if [[ "${is_incremental}" == "true" ]]; then
        current_oplog_ts=$(get_oplog_timestamp "${PROD_HOST}" "${PROD_USERNAME}" "${PROD_PASSWORD}" "${PROD_AUTH_DATABASE}")
        
        # Copy oplog.rs.bson to oplog.bson for mongorestore --oplogReplay
        # mongorestore expects oplog.bson in the dump directory root
        local oplog_rs_file="${dump_path}/local/oplog.rs.bson.gz"
        oplog_file="${dump_path}/oplog.bson.gz"
        if [[ -f "${oplog_rs_file}" ]]; then
            cp "${oplog_rs_file}" "${oplog_file}" || {
                error "Could not copy oplog file for replay"
                return 1
            }
            log "Oplog file prepared for replay: ${oplog_file}"
        else
            error "Oplog file not found at ${oplog_rs_file}"
            return 1
        fi
    fi
    
    # Restore to staging replica set
    local restore_exit_code=0
    if [[ "${is_incremental}" == "true" ]]; then
        log "Restoring incremental changes to staging replica set..."
        # Verify oplog file exists before restore
        if [[ ! -f "${oplog_file}" ]]; then
            error "Oplog file not found: ${oplog_file}"
            return 1
        fi
        
        # For incremental restore with oplog-only, use --oplogReplay
        # mongorestore --oplogReplay automatically looks for oplog.bson.gz in the dump root
        # The oplog entries contain database names, so mongorestore will apply them to the correct databases
        mongorestore \
            --host=${STAGING_HOST} \
            --username=${STAGING_USERNAME} \
            --password=${STAGING_PASSWORD} \
            --authenticationDatabase=${STAGING_AUTH_DATABASE} \
            --oplogReplay \
            --gzip \
            "${dump_path}" 2>&1
        
        restore_exit_code=$?
        
        if [[ ${restore_exit_code} -ne 0 ]]; then
            error "Failed to restore incremental changes. Exit code: ${restore_exit_code}"
            error "Note: Incremental restore requires the staging database to exist from a previous full backup."
            return 1
        fi
    else
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
            "${dump_path}" 2>&1
        
        restore_exit_code=$?
    fi
    
    if [[ ${restore_exit_code} -eq 0 ]]; then
        # Save backup metadata
        save_backup_metadata "mongodb_rs" "${backup_timestamp}" "${current_oplog_ts}"
        
        if [[ "${is_incremental}" == "true" ]]; then
            log "MongoDB replica set incremental sync completed successfully"
        else
            log "MongoDB replica set sync completed successfully"
        fi
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

# Display help message
show_help() {
    cat << EOF
Database Sync Script - Production to Staging

SYNOPSIS
    $0 [OPTIONS]

DESCRIPTION
    Syncs production MongoDB database to staging. Supports incremental MongoDB backups using oplog.

MongoDB Backup Strategy:
    - First backup: Full database dump with all collections
    - Subsequent backups: Incremental backups using oplog (oplog-only dumps)
    - Incremental backups require oplog availability (replica sets or standalone with oplog)
    - Use --full-backup flag to force a full backup instead of incremental

OPTIONS
    --replica-set         Use replica set sync mode (overrides .env setting)
    --no-replica-set      Disable replica set sync mode (overrides .env setting)
    --full-backup         Force a full MongoDB backup instead of incremental
    --no-cleanup          Skip cleanup of old backups (older than 7 days)
    -h, --help            Show this help message and exit

EXAMPLES
    # Sync database with automatic incremental backup
    $0

    # Force full backup instead of incremental
    $0 --full-backup

    # Sync with replica set mode
    $0 --replica-set

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - MongoDB: PROD_HOST, PROD_USERNAME, PROD_PASSWORD, PROD_AUTH_DATABASE, PROD_DB
               STAGING_HOST, STAGING_USERNAME, STAGING_PASSWORD, STAGING_AUTH_DATABASE, STAGING_DB
    - Optional: EXCLUDE_COLLECTIONS (space-separated list of collections to exclude)
                USE_REPLICA_SET (true/false)

    See env.example for configuration template.

BACKUP METADATA
    Backup metadata is stored in backups/.backup_metadata and tracks:
    - Last backup timestamp
    - Oplog position (for incremental backups)
    
    To reset incremental backups, delete backups/.backup_metadata

EOF
}

# Main function
main() {
    # Parse command line arguments first (before loading env to allow --help without config)
    
    # Check for help flag early
    for arg in "$@"; do
        if [[ "${arg}" == "-h" ]] || [[ "${arg}" == "--help" ]]; then
            show_help
            exit 0
        fi
    done
    
    log "=========================================="
    log "Database Sync: Production -> Staging"
    log "=========================================="
    
    # USE_REPLICA_SET is loaded from .env file, but can be overridden via command line
    
    # Parse remaining command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
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
            --full-backup)
                FORCE_FULL_BACKUP=true
                shift
                ;;
            *)
                error "Unknown option: $1"
                echo "Usage: $0 [OPTIONS]"
                echo "Run '$0 --help' for more information."
                exit 1
                ;;
        esac
    done
    
    # Sync database
    if [[ "${USE_REPLICA_SET:-false}" == "true" ]]; then
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
    
    # Cleanup old backups
    if [[ "${NO_CLEANUP:-false}" != "true" ]]; then
        cleanup_old_backups
    fi
    
    log "=========================================="
    log "Database sync completed successfully!"
    log "=========================================="
}

# Run main function
main "$@"

