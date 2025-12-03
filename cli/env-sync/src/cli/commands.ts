export interface CliOptions {
	dbOnly?: boolean
	help?: boolean
	noCleanup?: boolean
	replicaSet?: boolean
	storageOnly?: boolean
	verbose?: boolean
}

export function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {};

	for (const arg of args) {
		switch (arg) {
			case '--db-only':
				options.dbOnly = true;
				break;
			case '--help':
			case '-h':
				options.help = true;
				break;
			case '--no-cleanup':
				options.noCleanup = true;
				break;
			case '--no-replica-set':
				options.replicaSet = false;
				break;
			case '--replica-set':
				options.replicaSet = true;
				break;
			case '--storage-only':
				options.storageOnly = true;
				break;
			case '--verbose':
			case '-v':
				options.verbose = true;
				break;
			default:
				if (arg.startsWith('-')) {
					throw new Error(`Unknown option: ${arg}\nRun 'env-sync --help' for more information.`);
				}
				break;
		}
	}

	return options;
}

export function showHelp(): void {
	console.log(`
Environment Sync CLI - Production to Staging

SYNOPSIS
    env-sync [OPTIONS]

DESCRIPTION
    Syncs production environment data to staging, handling both OCI file storage
    and MongoDB database. Performs full MongoDB database dumps and restores.

MongoDB Backup Strategy:
    - Full database dump with all collections (excluding configured collections)
    - Restores to staging database with --drop flag

OPTIONS
    --db-only             Sync only MongoDB database, skip file sync
    --storage-only        Sync only OCI files, skip database sync
    --replica-set         Use replica set sync mode (overrides .env setting)
    --no-replica-set      Disable replica set sync mode (overrides .env setting)
    --no-cleanup          Skip cleanup of old backups (older than 7 days)
    -v, --verbose         Enable verbose output (show detailed command execution)
    -h, --help            Show this help message and exit

EXAMPLES
    # Sync both files and database (default behavior)
    env-sync

    # Sync only database
    env-sync --db-only

    # Sync files only
    env-sync --storage-only

    # Sync with replica set mode
    env-sync --replica-set

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - MongoDB: PROD_HOST, PROD_USERNAME, PROD_PASSWORD, PROD_AUTH_DATABASE, PROD_DB
               STAGING_HOST, STAGING_USERNAME, STAGING_PASSWORD, STAGING_AUTH_DATABASE, STAGING_DB
    - OCI/Rclone: RCLONE_REMOTE_NAME, RCLONE_TYPE, RCLONE_COMPARTMENT, RCLONE_NAMESPACE, RCLONE_REGION
                  OCI_USER, OCI_FINGERPRINT, OCI_KEY_FILE, OCI_TENANCY, OCI_REGION
    - Paths: OCI_SOURCE, OCI_DEST
    - Optional: EXCLUDE_COLLECTIONS (space-separated list of collections to exclude)
                BACKUP_RETENTION_DAYS (default: 7)

BACKUP METADATA
    Backup metadata is stored in backups/.backup_metadata and tracks:
    - Last backup timestamp
`);
}
