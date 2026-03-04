export interface CliOptions {
	backupOnly?: boolean
	dbOnly?: boolean
	envFile?: string
	help?: boolean
	noCleanup?: boolean
	replicaSet?: boolean
	storageOnly?: boolean
	uploadArtifacts?: boolean
	verbose?: boolean
}

export function parseArgs(args: string[]): CliOptions {
	const options: CliOptions = {};

	for (let i = 0; i < args.length; i++) {
		const arg = args[i];

		// Options that take a value
		switch (arg) {
			case '--env-file': {
				const value = args[i + 1];
				if (!value || value.startsWith('-')) {
					throw new Error(`Missing value for --env-file option\nRun 'env-sync --help' for more information.`);
				}
				options.envFile = value;
				i += 1;
				continue;
			}
			default:
				if (arg.startsWith('--env-file=')) {
					const [, value] = arg.split('=', 2);
					if (!value) {
						throw new Error(`Missing value for --env-file option\nRun 'env-sync --help' for more information.`);
					}
					options.envFile = value;
					continue;
				}
		}

		switch (arg) {
			case '--backup-only':
				options.backupOnly = true;
				break;
			case '--db-only':
				options.dbOnly = true;
				break;
			case '--env-file':
				// Handled above (value option)
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
			case '--upload-artifacts':
				options.uploadArtifacts = true;
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
    --backup-only         Backup MongoDB only (dump without restoring to staging)
    --db-only             Sync only MongoDB database, skip file sync
    --storage-only        Sync only OCI files, skip database sync
    --upload-artifacts    Upload backup artifacts to OCI bucket (instead of GitHub artifacts)
    --env-file PATH       Use a specific .env file instead of the default in the script directory
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

    # Upload backup artifacts to OCI bucket (for CI/CD)
    env-sync --upload-artifacts

    # Backup database only (no restore to staging, no storage sync)
    env-sync --backup-only

    # Backup and upload artifacts to OCI bucket
    env-sync --backup-only --upload-artifacts

    # Or combine with sync operations
    env-sync --db-only --upload-artifacts

CONFIGURATION
    The script reads configuration from .env file in the script directory.
    Required variables:
    - MongoDB: PROD_HOST, PROD_USERNAME, PROD_PASSWORD, PROD_AUTH_DATABASE, PROD_DB
               STAGING_HOST, STAGING_USERNAME, STAGING_PASSWORD, STAGING_AUTH_DATABASE, STAGING_DB
    - OCI/Rclone: STORAGE_REMOTE_NAME, STORAGE_TYPE, OCI_COMPARTMENT, OCI_NAMESPACE, OCI_REGION
                  OCI_USER, OCI_FINGERPRINT, OCI_KEY_FILE, OCI_TENANCY
    - Paths: STORAGE_SOURCE, STORAGE_DEST
    - Artifacts: ARTIFACTS_BUCKET (required for --upload-artifacts)
                 ARTIFACTS_PREFIX (optional, default: "env-sync")
    - Optional: EXCLUDE_COLLECTIONS (space-separated list of collections to exclude)
                BACKUP_RETENTION_DAYS (default: 7)

BACKUP METADATA
    Backup metadata is stored in backups/.backup_metadata and tracks:
    - Last backup timestamp
`);
}
