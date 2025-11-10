#!/bin/bash

# Environment Sync Script (Wrapper)
# Syncs production environment data to staging
# This script is a wrapper that calls sync-db.sh and sync-storage.sh
#
# For separate operations, use:
# - sync-db.sh      : Database sync only
# - sync-storage.sh : Storage sync only

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


# Display help message
show_help() {
    cat << EOF
Environment Sync Script - Production to Staging

SYNOPSIS
    $0 [OPTIONS]

DESCRIPTION
    Syncs production environment data to staging, handling both OCI file storage
    and MongoDB database. Supports incremental MongoDB backups using oplog.

MongoDB Backup Strategy:
    - First backup: Full database dump with all collections
    - Subsequent backups: Incremental backups using oplog (oplog-only dumps)
    - Incremental backups require oplog availability (replica sets or standalone with oplog)
    - Use --full-backup flag to force a full backup instead of incremental

OPTIONS
    --files-only          Sync only OCI files, skip database sync
    --db-only             Sync only MongoDB database, skip file sync
    --replica-set         Use replica set sync mode (overrides .env setting)
    --no-replica-set      Disable replica set sync mode (overrides .env setting)
    --full-backup         Force a full MongoDB backup instead of incremental
    --no-cleanup          Skip cleanup of old backups (older than 7 days)
    -h, --help            Show this help message and exit

EXAMPLES
    # Sync both files and database (default behavior)
    $0

    # Sync only database with incremental backup
    $0 --db-only

    # Force full backup instead of incremental
    $0 --full-backup

    # Sync files only
    $0 --files-only

    # Sync with replica set mode
    $0 --replica-set

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - MongoDB: PROD_HOST, PROD_USERNAME, PROD_PASSWORD, PROD_AUTH_DATABASE, PROD_DB
               STAGING_HOST, STAGING_USERNAME, STAGING_PASSWORD, STAGING_AUTH_DATABASE, STAGING_DB
    - OCI/Rclone: RCLONE_REMOTE_NAME, RCLONE_TYPE, RCLONE_COMPARTMENT, RCLONE_NAMESPACE, RCLONE_REGION
                  OCI_USER, OCI_FINGERPRINT, OCI_KEY_FILE, OCI_TENANCY, OCI_REGION
    - Paths: OCI_SOURCE, OCI_DEST

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
    SYNC_FILES="${SYNC_FILES:-true}"
    SYNC_DB="${SYNC_DB:-true}"
    
    # Check for help flag early
    for arg in "$@"; do
        if [[ "${arg}" == "-h" ]] || [[ "${arg}" == "--help" ]]; then
            show_help
            exit 0
        fi
    done
    
    log "=========================================="
    log "Environment Sync: Production -> Staging"
    log "=========================================="
    
    # Get script directory
    SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
    
    # Build arguments to pass to sub-scripts
    DB_ARGS=()
    STORAGE_ARGS=()
    
    # Parse command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --files-only)
                SYNC_DB=false
                shift
                ;;
            --db-only)
                SYNC_FILES=false
                shift
                ;;
            --replica-set|--no-replica-set|--full-backup)
                # Pass database-specific options to sync-db.sh
                DB_ARGS+=("$1")
                shift
                ;;
            --no-cleanup)
                # Pass cleanup option to both scripts
                DB_ARGS+=("$1")
                STORAGE_ARGS+=("$1")
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
    
    # Sync files
    if [[ "${SYNC_FILES}" == "true" ]]; then
        log "Syncing storage..."
        "${SCRIPT_DIR}/sync-storage.sh" "${STORAGE_ARGS[@]}" || {
            error "Failed to sync OCI files"
            exit 1
        }
    fi
    
    # Sync database
    if [[ "${SYNC_DB}" == "true" ]]; then
        log "Syncing database..."
        "${SCRIPT_DIR}/sync-db.sh" "${DB_ARGS[@]}" || {
                error "Failed to sync MongoDB"
                exit 1
            }
    fi
    
    log "=========================================="
    log "Environment sync completed successfully!"
    log "=========================================="
}

# Run main function
main "$@"

