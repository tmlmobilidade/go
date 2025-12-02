# Environment Sync CLI

CLI tool to sync production and staging environments for MongoDB and Storage (using RClone).

## Installation

```bash
npm install
npm run build
```

## Usage

### Basic Usage

```bash
# Sync both MongoDB and Storage (interactive mode)
npm run dev

# Run with arguments (use -- to pass arguments to the script)
npm run dev -- --help
npm run dev -- --db-only
npm run dev -- --storage-only

# Or after building:
./dist/index.js
./dist/index.js --help
```

### Command Line Options

```bash
# Sync only MongoDB database
env-sync --db-only

# Sync only storage
env-sync --storage-only

# Use replica set mode
env-sync --replica-set

# Skip cleanup of old backups
env-sync --no-cleanup

# Show help
env-sync --help
```

## Configuration

Create a `.env` file in the `cli/env-sync-ts/` directory with the following variables:

### MongoDB Configuration

```env
# Production MongoDB
PROD_HOST=production-mongo-host:27017
PROD_USERNAME=admin
PROD_PASSWORD=password
PROD_AUTH_DATABASE=admin
PROD_DB=production_database

# Staging MongoDB
STAGING_HOST=staging-mongo-host:27017
STAGING_USERNAME=admin
STAGING_PASSWORD=password
STAGING_AUTH_DATABASE=admin
STAGING_DB=staging_database

# Optional: Collections to exclude from sync (space-separated)
EXCLUDE_COLLECTIONS=logs sessions temp_data

# Optional: Backup retention days (default: 7)
BACKUP_RETENTION_DAYS=7
```

### Storage Configuration (OCI/RClone)

```env
# RClone Configuration
RCLONE_REMOTE_NAME=oci_storage
RCLONE_TYPE=oracleobjectstorage
RCLONE_COMPARTMENT=ocid1.compartment.oc1..
RCLONE_NAMESPACE=your_namespace
RCLONE_REGION=us-ashburn-1

# OCI Authentication
OCI_USER=ocid1.user.oc1..
OCI_FINGERPRINT=aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99
OCI_KEY_FILE=/path/to/private_key.pem
OCI_TENANCY=ocid1.tenancy.oc1..
OCI_REGION=us-ashburn-1

# Storage Paths
OCI_SOURCE=production_bucket:path/to/source
OCI_DEST=staging_bucket:path/to/dest
```

## MongoDB Backup Strategy

- Full database dump with all collections (excluding configured collections)
- Dumps all collections from production database
- Restores to staging database with `--drop` flag

### Backup Metadata
- Backup metadata is stored in `backups/.backup_metadata`
- Tracks last backup timestamp

## Storage Sync

- Uses RClone to sync files from production OCI storage to staging
- Configured via environment variables (no rclone config file needed)
- Progress reporting during sync

## Development

```bash
# Run in development mode
npm run dev

# Build
npm run build

# Lint
npm run lint
```

## Requirements

- Node.js (v18+)
- MongoDB tools (`mongodump`, `mongorestore`)
- RClone (`rclone`)

## Notes

- The script maintains compatibility with the existing bash scripts' `.env` file format
- Backups are stored in `backups/` directory
- Old backups are automatically cleaned up (configurable retention period)
- Interactive prompts use Clack for a modern CLI experience

