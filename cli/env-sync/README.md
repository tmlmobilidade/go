# Environment Sync

Shell scripts to sync production environment data to staging, including OCI file storage and MongoDB database.

## Scripts

- **`sync.sh`**: Wrapper script that syncs both database and storage (maintains backward compatibility)
- **`sync-db.sh`**: Database sync script - syncs MongoDB from production to staging
- **`sync-storage.sh`**: Storage sync script - syncs OCI file storage from production to staging

## Features

- **OCI File Sync**: Uses rclone to sync files from production to staging OCI buckets
- **MongoDB Sync**: Supports both standalone and replica set configurations
- **Incremental Backups**: Automatic incremental MongoDB backups using oplog (after first full backup)
- **Backup Management**: Automatically creates backups before syncing and cleans up old backups
- **Error Handling**: Comprehensive error checking and logging
- **Flexible Configuration**: Supports environment variables and command-line arguments

## Prerequisites

1. **rclone**: Install rclone for OCI file sync
   ```bash
   brew install rclone  # macOS
   # or
   apt-get install rclone  # Linux
   ```

2. **MongoDB Tools**: Install MongoDB database tools
   ```bash
   brew install mongodb-community  # macOS
   # or
   apt-get install mongodb-database-tools  # Linux
   ```

3. **Configuration File**: Copy and configure the environment file
   ```bash
   cp env.example .env
   # Edit .env with your credentials
   ```

## Setup

1. Clone this repository
2. Copy the example environment file:
   ```bash
   cp env.example .env
   ```
3. Edit `.env` with your credentials:
   - MongoDB connection details (production and staging)
   - OCI storage paths
   - Rclone OCI configuration variables
4. Make the scripts executable:
   ```bash
   chmod +x sync.sh sync-db.sh sync-storage.sh
   ```

The scripts will automatically generate the rclone configuration from your `env` variables.

## Configuration

All configuration is stored in the `.env` file. Edit this file with your settings:

### MongoDB Configuration

Edit MongoDB connection parameters in `.env`:

#### MongoDB Configuration (Standalone)
```bash
# Production MongoDB Configuration
PROD_HOST=host:27017
PROD_USERNAME=backup
PROD_PASSWORD=1234
PROD_AUTH_DATABASE=admin
PROD_DB=production

# Staging MongoDB Configuration
STAGING_HOST=host:27017
STAGING_USERNAME=backup
STAGING_PASSWORD=1234
STAGING_AUTH_DATABASE=admin
STAGING_DB=staging

USE_REPLICA_SET=false

# Collections to exclude from sync (space-separated)
EXCLUDE_COLLECTIONS="rides hashed_shapes hashed_trips simplified_apex_locations simplified_apex_on_board_refunds simplified_apex_on_board_sales simplified_apex_validations"
```

#### MongoDB Configuration (Replica Set)
```bash
# For replica sets, specify multiple hosts: host1:port1,host2:port2,host3:port3
PROD_HOST=prod-host.1:27017,prod-host.2:27017,prod-host.3:27017
PROD_USERNAME=backup
PROD_PASSWORD=1234
PROD_AUTH_DATABASE=admin
PROD_DB=production

STAGING_HOST=staging-host.1:27017,staging-host.2:27017,staging-host.3:27017
STAGING_USERNAME=backup
STAGING_PASSWORD=1234
STAGING_AUTH_DATABASE=admin
STAGING_DB=staging

PROD_RS_NAME=prod-rs
STAGING_RS_NAME=staging-rs
USE_REPLICA_SET=true

EXCLUDE_COLLECTIONS="rides hashed_shapes hashed_trips simplified_apex_locations simplified_apex_on_board_refunds simplified_apex_on_board_sales simplified_apex_validations"
```

The `USE_REPLICA_SET` setting in the `.env` file can be overridden via command line with `--replica-set` or `--no-replica-set` flags.

### OCI File Sync Configuration

Edit the OCI source and destination paths in `.env`:

```bash
OCI_SOURCE="tmlmobilidade-sae-production/"
OCI_DEST="tmlmobilidade-sae-staging/"
```

These can also be modified in the `.env` file if needed.

### Rclone Configuration

Edit the rclone OCI configuration variables in `.env`:

```bash
RCLONE_REMOTE_NAME="OCI - TML SAE"
RCLONE_TYPE=oci
RCLONE_COMPARTMENT=ocid1.compartment.oc1..xxxxx
RCLONE_NAMESPACE=your_namespace
RCLONE_REGION=us-ashburn-1
RCLONE_CONFIG_FILE=/path/to/oci/config/file
```

The script automatically generates `secrets/rclone.conf` from these variables at runtime.

## Usage

### Using the Wrapper Script (sync.sh)

The `sync.sh` script is a wrapper that calls both `sync-db.sh` and `sync-storage.sh`:

#### Sync Everything (Default)
```bash
./sync.sh
```

#### Sync Only Files
```bash
./sync.sh --files-only
```

#### Sync Only Database
```bash
./sync.sh --db-only
```

#### Use Replica Set Configuration
```bash
# Automatically uses replica set based on .env, or force it:
./sync.sh --replica-set

# Force disable replica set even if configured:
./sync.sh --no-replica-set
```

#### Force Full Backup (instead of incremental)
```bash
./sync.sh --full-backup
```

#### Skip Backup Cleanup
```bash
./sync.sh --no-cleanup
```

### Using Individual Scripts

#### Database Sync (sync-db.sh)

```bash
# Sync database with automatic incremental backup
./sync-db.sh

# Force full backup instead of incremental
./sync-db.sh --full-backup

# Use replica set mode
./sync-db.sh --replica-set

# Disable replica set mode
./sync-db.sh --no-replica-set

# Skip cleanup
./sync-db.sh --no-cleanup

# Show help
./sync-db.sh --help
```

#### Storage Sync (sync-storage.sh)

```bash
# Sync storage from production to staging
./sync-storage.sh

# Skip cleanup
./sync-storage.sh --no-cleanup

# Show help
./sync-storage.sh --help
```

## How It Works

### OCI File Sync
- Uses rclone to sync files from production OCI bucket to staging
- Performs one-way sync (production → staging)

### MongoDB Sync
- **First Backup**: Full database dump with all collections (excluding configured exclusions)
- **Subsequent Backups**: Incremental backups using oplog (oplog-only dumps)
- Uses mongodump to export production database and mongorestore to import to staging
- Incremental backups require oplog availability (replica sets or standalone with oplog enabled)
- Backup metadata is stored in `backups/.backup_metadata` to track last backup timestamp and oplog position

### Backup Management
- Creates timestamped backups before syncing
- Automatically removes backups older than 7 days
- Backup metadata tracks incremental backup state

## Backup Location

All backups are stored in the `backups/` directory:
- OCI file backups: `backups/oci_files_YYYYMMDD_HHMMSS/`
- MongoDB full backups: `backups/mongodb_YYYYMMDD_HHMMSS/`
- MongoDB incremental backups: `backups/mongodb_incr_YYYYMMDD_HHMMSS/`
- MongoDB replica set full backups: `backups/mongodb_rs_YYYYMMDD_HHMMSS/`
- MongoDB replica set incremental backups: `backups/mongodb_rs_incr_YYYYMMDD_HHMMSS/`
- Backup metadata: `backups/.backup_metadata` (tracks last backup timestamp and oplog position)

### Incremental Backup Reset

To reset incremental backups and force a full backup on the next run:
```bash
rm backups/.backup_metadata
```

## Security Notes

- Never commit `.env` or `secrets/rclone.conf` to version control
- Keep credentials secure in the `.env` file
- The rclone configuration is generated automatically from `.env` variables at runtime
- Ensure proper network security for MongoDB connections
- The `backups/` directory may contain sensitive data
- Backup metadata file (`.backup_metadata`) contains timestamps but no sensitive data

## Troubleshooting

### Rclone errors
- Verify your rclone configuration variables in `.env` are correct
- Test connection: `rclone lsd "" --config=secrets/rclone.conf`
- Verify the bucket paths in `.env` match your rclone remote configuration
- Check that `RCLONE_CONFIG_FILE` points to a valid OCI config file

### MongoDB errors
- Verify connection parameters are correct in `.env`
- Check network connectivity to MongoDB servers
- Ensure user has proper permissions for dump/restore operations
- For replica sets, verify the replica set name matches and `USE_REPLICA_SET` is set correctly
- Check that excluded collections are listed correctly (space-separated, no commas)

### Permission errors
- Ensure the scripts are executable: `chmod +x sync.sh sync-db.sh sync-storage.sh`
- Check write permissions for the `backups/` directory

### Incremental backup issues
- If incremental restore fails, ensure staging database exists from a previous full backup
- To reset incremental backups: `rm backups/.backup_metadata`
- Use `--full-backup` flag to force a full backup instead of incremental

## Example Workflow

```bash
# 1. Configure all settings in .env:
#    PROD_HOST=prod-db1:27017,prod-db2:27017,prod-db3:27017
#    PROD_USERNAME=backup
#    PROD_PASSWORD=password
#    PROD_AUTH_DATABASE=admin
#    PROD_DB=production
#    STAGING_HOST=staging-db1:27017,staging-db2:27017,staging-db3:27017
#    STAGING_USERNAME=backup
#    STAGING_PASSWORD=password
#    STAGING_AUTH_DATABASE=admin
#    STAGING_DB=staging
#    USE_REPLICA_SET=true
#    EXCLUDE_COLLECTIONS="rides hashed_shapes hashed_trips"
#    OCI_SOURCE="tmlmobilidade-sae-production/"
#    OCI_DEST="tmlmobilidade-sae-staging/"

# 2. Run sync (replica set support is automatically enabled from config)
#    First run will do a full backup, subsequent runs will use incremental backups
./sync.sh

# Or sync individually:
./sync-db.sh --replica-set      # Database only
./sync-storage.sh                # Storage only
```

## License

Private - TML Internal Use Only

   