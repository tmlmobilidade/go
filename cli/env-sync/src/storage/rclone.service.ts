import type { StorageConfig } from '../config/config-loader.js';

import { existsSync } from 'fs';

import { checkCommandAvailable, execCommandStream } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

export function setupRcloneEnvironment(config: StorageConfig): NodeJS.ProcessEnv {
	// Disable rclone config file to force use of environment variables only
	const env: NodeJS.ProcessEnv = {
		...process.env,
		RCLONE_CONFIG: '/dev/null',
	};

	// Convert remote name: uppercase for env vars, lowercase for paths
	const rcloneRemoteEnvName = config.rcloneRemoteName
		.toUpperCase()
		.replace(/[^A-Z0-9]/g, '_')
		.replace(/__+/g, '_')
		.replace(/^_|_$/g, '');
	const rcloneRemotePathName = config.rcloneRemoteName
		.toLowerCase()
		.replace(/[^a-z0-9]/g, '_')
		.replace(/__+/g, '_')
		.replace(/^_|_$/g, '');

	// Set rclone remote configuration via environment variables (must be UPPERCASE)
	env[`RCLONE_CONFIG_${rcloneRemoteEnvName}_TYPE`] = config.rcloneType;
	env[`RCLONE_CONFIG_${rcloneRemoteEnvName}_ENV_AUTH`] = 'true';
	env[`RCLONE_CONFIG_${rcloneRemoteEnvName}_COMPARTMENT`] = config.rcloneCompartment;
	env[`RCLONE_CONFIG_${rcloneRemoteEnvName}_NAMESPACE`] = config.rcloneNamespace;
	env[`RCLONE_CONFIG_${rcloneRemoteEnvName}_REGION`] = config.rcloneRegion;

	// When env_auth=true, rclone's OOS backend uses ONLY the standard OCI environment variables
	// and ignores RCLONE_CONFIG_* auth variables. Set the standard OCI variables.
	env.OCI_TENANCY = config.ociTenancy;
	env.OCI_USER = config.ociUser;
	env.OCI_FINGERPRINT = config.ociFingerprint;
	env.OCI_KEY_FILE = config.ociKeyFile;
	env.OCI_REGION = config.ociRegion;

	// Normalize OCI_SOURCE and OCI_DEST to use the sanitized remote name
	let ociSource = config.ociSource;
	let ociDest = config.ociDest;

	if (ociSource && ociSource.includes(':')) {
		const sourcePath = ociSource.split(':').slice(1).join(':');
		ociSource = `${rcloneRemotePathName}:${sourcePath}`;
	}
	else if (ociSource) {
		ociSource = `${rcloneRemotePathName}:${ociSource}`;
	}

	if (ociDest && ociDest.includes(':')) {
		const destPath = ociDest.split(':').slice(1).join(':');
		ociDest = `${rcloneRemotePathName}:${destPath}`;
	}
	else if (ociDest) {
		ociDest = `${rcloneRemotePathName}:${ociDest}`;
	}

	env.OCI_SOURCE = ociSource;
	env.OCI_DEST = ociDest;

	return env;
}

export async function syncStorage(config: StorageConfig): Promise<void> {
	logger.info('Starting OCI file sync...');

	// Check if rclone is available
	if (!(await checkCommandAvailable('rclone'))) {
		throw new Error('rclone not found. Please install rclone.');
	}

	// Setup RClone environment
	const rcloneEnv = setupRcloneEnvironment(config);

	const ociSource = rcloneEnv.OCI_SOURCE || config.ociSource;
	const ociDest = rcloneEnv.OCI_DEST || config.ociDest;

	// Verify required OCI environment variables are present (for env_auth mode)
	if (!rcloneEnv.OCI_TENANCY || !rcloneEnv.OCI_TENANCY.trim()) {
		throw new Error(`Missing OCI_TENANCY configuration. Please ensure OCI_TENANCY is set in your .env file.`);
	}

	if (!rcloneEnv.OCI_USER || !rcloneEnv.OCI_USER.trim()) {
		throw new Error(`Missing OCI_USER configuration. Please ensure OCI_USER is set in your .env file.`);
	}

	if (!rcloneEnv.OCI_FINGERPRINT || !rcloneEnv.OCI_FINGERPRINT.trim()) {
		throw new Error(`Missing OCI_FINGERPRINT configuration. Please ensure OCI_FINGERPRINT is set in your .env file.`);
	}

	if (!rcloneEnv.OCI_KEY_FILE || !rcloneEnv.OCI_KEY_FILE.trim()) {
		throw new Error(`Missing OCI_KEY_FILE configuration. Please ensure OCI_KEY_FILE is set in your .env file.`);
	}

	if (!rcloneEnv.OCI_REGION || !rcloneEnv.OCI_REGION.trim()) {
		throw new Error(`Missing OCI_REGION configuration. Please ensure OCI_REGION is set in your .env file.`);
	}

	if (!existsSync(rcloneEnv.OCI_KEY_FILE)) {
		throw new Error(`OCI key file not found at: ${rcloneEnv.OCI_KEY_FILE}. Please verify the OCI_KEY_FILE path in your .env file.`);
	}

	logger.info(`Source: ${ociSource}`);
	logger.info(`Destination: ${ociDest}`);
	logger.verbose(`RClone remote: ${config.rcloneRemoteName}`);
	logger.verbose(`RClone type: ${config.rcloneType}`);
	logger.verbose(`OCI region: ${rcloneEnv.OCI_REGION}`);
	logger.verbose(`OCI tenancy configured: ${rcloneEnv.OCI_TENANCY ? 'yes' : 'no'}`);
	logger.verbose(`OCI user: ${rcloneEnv.OCI_USER}`);
	logger.verbose(`OCI fingerprint: ${rcloneEnv.OCI_FINGERPRINT}`);
	logger.verbose(`OCI key file: ${rcloneEnv.OCI_KEY_FILE}`);

	// Sync production to staging
	logger.info('Syncing files from production to staging...');

	const syncCmd = `rclone sync "${ociSource}" "${ociDest}" --progress --verbose`;

	try {
		// Use streaming execution to show rclone progress in real-time
		await execCommandStream(syncCmd, { env: rcloneEnv });
		logger.success('OCI file sync completed successfully');
	}
	catch (error) {
		logger.error(`OCI file sync failed: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
