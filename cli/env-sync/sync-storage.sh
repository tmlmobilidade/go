#!/bin/bash

# Storage Sync Script
# Syncs production OCI file storage to staging

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

# Validate required rclone variables
if [[ -z "${RCLONE_REMOTE_NAME:-}" ]] || [[ -z "${RCLONE_TYPE:-}" ]] || \
   [[ -z "${RCLONE_COMPARTMENT:-}" ]] || [[ -z "${RCLONE_NAMESPACE:-}" ]] || \
   [[ -z "${RCLONE_REGION:-}" ]]; then
    error "Rclone configuration variables not set in ${ENV_FILE}"
    error "Required variables: RCLONE_REMOTE_NAME, RCLONE_TYPE, RCLONE_COMPARTMENT, RCLONE_NAMESPACE, RCLONE_REGION"
    exit 1
fi

# Validate required OCI variables
if [[ -z "${OCI_USER:-}" ]] || [[ -z "${OCI_FINGERPRINT:-}" ]] || \
   [[ -z "${OCI_KEY_FILE:-}" ]] || [[ -z "${OCI_TENANCY:-}" ]] || \
   [[ -z "${OCI_REGION:-}" ]]; then
    error "OCI configuration variables not set in ${ENV_FILE}"
    error "Required variables: OCI_USER, OCI_FINGERPRINT, OCI_KEY_FILE, OCI_TENANCY, OCI_REGION"
    exit 1
fi

# Set rclone environment variables from .env file
# Convert remote name: uppercase for env vars, lowercase for paths
# Environment variable names must be UPPERCASE, but paths can be lowercase
RCLONE_REMOTE_ENV_NAME=$(echo "${RCLONE_REMOTE_NAME}" | tr '[:lower:]' '[:upper:]' | sed 's/[^A-Z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_\|_$//g')
RCLONE_REMOTE_PATH_NAME=$(echo "${RCLONE_REMOTE_NAME}" | tr '[:upper:]' '[:lower:]' | sed 's/[^a-z0-9]/_/g' | sed 's/__*/_/g' | sed 's/^_\|_$//g')

# Disable rclone config file to force use of environment variables only
export RCLONE_CONFIG=/dev/null

# Set rclone remote configuration via environment variables (must be UPPERCASE)
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_TYPE=\"${RCLONE_TYPE}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_COMPARTMENT=\"${RCLONE_COMPARTMENT}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_NAMESPACE=\"${RCLONE_NAMESPACE}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_REGION=\"${RCLONE_REGION}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_USER=\"${OCI_USER}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_FINGERPRINT=\"${OCI_FINGERPRINT}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_KEY_FILE=\"${OCI_KEY_FILE}\""
eval "export RCLONE_CONFIG_${RCLONE_REMOTE_ENV_NAME}_TENANCY=\"${OCI_TENANCY}\""

# Normalize OCI_SOURCE and OCI_DEST to use the sanitized remote name for rclone compatibility
# Extract the path part (everything after the first colon) and reconstruct with sanitized remote name
# Use lowercase path name (rclone is case-insensitive but paths typically use lowercase)
if [[ -n "${OCI_SOURCE:-}" ]]; then
    # If path contains a colon, extract everything after it; otherwise use the whole value as path
    if [[ "${OCI_SOURCE}" == *:* ]]; then
        OCI_SOURCE_PATH="${OCI_SOURCE#*:}"
    else
        OCI_SOURCE_PATH="${OCI_SOURCE}"
    fi
    OCI_SOURCE="${RCLONE_REMOTE_PATH_NAME}:${OCI_SOURCE_PATH}"
fi
if [[ -n "${OCI_DEST:-}" ]]; then
    # If path contains a colon, extract everything after it; otherwise use the whole value as path
    if [[ "${OCI_DEST}" == *:* ]]; then
        OCI_DEST_PATH="${OCI_DEST#*:}"
    else
        OCI_DEST_PATH="${OCI_DEST}"
    fi
    OCI_DEST="${RCLONE_REMOTE_PATH_NAME}:${OCI_DEST_PATH}"
fi

# Function to sync OCI files
sync_oci_files() {
    log "Starting OCI file sync..."
    
    # Source and destination OCI paths are set globally at the top of the script
    log "Source: ${OCI_SOURCE}"
    log "Destination: ${OCI_DEST}"
    
    # Check if rclone is available
    if ! command -v rclone &> /dev/null; then
        error "rclone not found. Please install rclone."
        return 1
    fi
    
    # Sync production to staging
    log "Syncing files from production to staging..."
    rclone sync "${OCI_SOURCE}" "${OCI_DEST}" \
        --progress \
        --verbose
    
    if [[ $? -eq 0 ]]; then
        log "OCI file sync completed successfully"
    else
        error "OCI file sync failed"
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
Storage Sync Script - Production to Staging

SYNOPSIS
    $0 [OPTIONS]

DESCRIPTION
    Syncs production OCI file storage to staging using rclone.

OPTIONS
    --no-cleanup          Skip cleanup of old backups (older than 7 days)
    -h, --help            Show this help message and exit

EXAMPLES
    # Sync storage from production to staging
    $0

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - OCI/Rclone: RCLONE_REMOTE_NAME, RCLONE_TYPE, RCLONE_COMPARTMENT, RCLONE_NAMESPACE, RCLONE_REGION
                  OCI_USER, OCI_FINGERPRINT, OCI_KEY_FILE, OCI_TENANCY, OCI_REGION
    - Paths: OCI_SOURCE, OCI_DEST

    See env.example for configuration template.

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
    log "Storage Sync: Production -> Staging"
    log "=========================================="
    
    # Parse remaining command line arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            -h|--help)
                show_help
                exit 0
                ;;
            --no-cleanup)
                NO_CLEANUP=true
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
    sync_oci_files || {
        error "Failed to sync OCI files"
        exit 1
    }
    
    # Cleanup old backups
    if [[ "${NO_CLEANUP:-false}" != "true" ]]; then
        cleanup_old_backups
    fi
    
    log "=========================================="
    log "Storage sync completed successfully!"
    log "=========================================="
}

# Run main function
main "$@"

