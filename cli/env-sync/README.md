# Environment Sync

A shell script to sync production environment data to staging, including OCI file storage and MongoDB database.

## Features

- **OCI File Sync**: Uses rclone to sync files from production to staging OCI buckets
- **MongoDB Sync**: Supports both standalone and replica set configurations
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
   cp env.example env
   # Edit env with your credentials
   ```

## Setup

1. Clone this repository
2. Copy the example environment file:
   ```bash
   cp env.example env
   ```
3. Edit `env` with your credentials:
   - MongoDB connection details (production and staging)
   - OCI storage paths
   - Rclone OCI configuration variables
4. Make the script executable:
   ```bash
   chmod +x sync.sh
   ```

The script will automatically generate the rclone configuration file from your `env` variables.

## Configuration

All configuration is stored in the `env` file. Edit this file with your settings:

### MongoDB Configuration

Edit MongoDB connection parameters in `env`:

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

The `USE_REPLICA_SET` setting in the `env` file can be overridden via command line with `--replica-set` or `--no-replica-set` flags.

### OCI File Sync Configuration

Edit the OCI source and destination paths in `env`:

```bash
OCI_SOURCE="OCI - TML SAE:tmlmobilidade-sae-production/"
OCI_DEST="OCI - TML SAE:tmlmobilidade-sae-staging/"
```

These can also be modified in the `env` file if needed.

### Rclone Configuration

Edit the rclone OCI configuration variables in `env`:

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

### Sync Everything (Default)
```bash
./sync.sh
```

### Sync Only Files
```bash
./sync.sh --files-only
```

### Sync Only Database
```bash
./sync.sh --db-only
```

### Use Replica Set Configuration
```bash
# Automatically uses replica set based on mongo.conf, or force it:
./sync.sh --replica-set

# Force disable replica set even if configured:
./sync.sh --no-replica-set
```

### Skip Backup Cleanup
```bash
./sync.sh --no-cleanup
```

### Combined Options
```bash
./sync.sh --db-only --replica-set
```

## How It Works

1. **OCI File Sync**: Uses rclone to copy files from production OCI bucket to staging
2. **MongoDB Sync**: Uses mongodump to export production database and mongorestore to import to staging
3. **Backups**: Creates timestamped backups before syncing
4. **Cleanup**: Automatically removes backups older than 7 days

## Backup Location

All backups are stored in the `backups/` directory:
- OCI file backups: `backups/oci_files_YYYYMMDD_HHMMSS/`
- MongoDB backups: `backups/mongodb_YYYYMMDD_HHMMSS/`
- MongoDB replica set backups: `backups/mongodb_rs_YYYYMMDD_HHMMSS/`

## Security Notes

- Never commit `env` or `secrets/rclone.conf` to version control
- Keep credentials secure in the `env` file
- The rclone config file is generated automatically from `env` variables
- Ensure proper network security for MongoDB connections
- The `backups/` directory may contain sensitive data

## Troubleshooting

### Rclone errors
- Verify your rclone configuration variables in `env` are correct
- Test connection: `rclone lsd "OCI - TML SAE:" --config=secrets/rclone.conf`
- Verify the bucket paths in `env` match your rclone remote configuration
- Check that `RCLONE_CONFIG_FILE` points to a valid OCI config file

### MongoDB errors
- Verify connection parameters are correct in `env`
- Check network connectivity to MongoDB servers
- Ensure user has proper permissions for dump/restore operations
- For replica sets, verify the replica set name matches and `USE_REPLICA_SET` is set correctly
- Check that excluded collections are listed correctly (space-separated, no commas)

### Permission errors
- Ensure the script is executable: `chmod +x sync.sh`
- Check write permissions for the `backups/` directory

## Example Workflow

```bash
# 1. Configure all settings in env:
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

# 2. Run sync (replica set support is automatically enabled from config)
./sync.sh
```

## License

Private - TML Internal Use Only

