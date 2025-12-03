import type { StorageConfig } from '../config/config-loader.js';

import { writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { checkCommandAvailable, execCommandStream } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

function buildRcloneConfig(config: StorageConfig): string {
	return `
		[${config.remoteName}]
		type = ${config.type}
		namespace = ${config.namespace}
		compartment = ${config.compartment}
		region = ${config.region}
		tenancy = ${config.tenancy}
		user = ${config.user}
		fingerprint = ${config.fingerprint}
		key_file = ${config.keyFile}
	`;
}

export async function syncStorage(config: StorageConfig): Promise<void> {
	logger.info('Starting OCI file sync...');

	// Check if rclone is available
	if (!(await checkCommandAvailable('rclone'))) {
		throw new Error('rclone not found. Please install rclone.');
	}

	// Build rclone config
	logger.info('Building rclone config...');
	const rcloneConfig = buildRcloneConfig(config);
	const rcloneConfigFile = path.join(os.tmpdir(), 'rclone.conf');
	writeFileSync(rcloneConfigFile, rcloneConfig);

	// Sync production to staging
	logger.info('Syncing files from production to staging...');

	// Use the configured remote name so that rclone talks to OCI Object Storage
	// instead of treating source/dest as local filesystem paths.
	const sourcePath = `${config.remoteName}:${config.source}`;
	const destPath = `${config.remoteName}:${config.dest}`;
	const syncCmd = `rclone sync "${sourcePath}" "${destPath}" --config ${rcloneConfigFile} --progress --verbose`;

	try {
		// Use streaming execution to show rclone progress in real-time
		await execCommandStream(syncCmd);
		logger.success('OCI file sync completed successfully');
	}
	catch (error) {
		logger.error(`OCI file sync failed: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
