import type { StorageConfig } from '../config/config-loader.js';

import { rmSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { checkCommandAvailable, execCommandStream } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

/**
 * Build a temporary OCI CLI config file using the credentials from StorageConfig.
 * This lets rclone use the "user_principal_auth" provider without needing ~/.oci/config.
 *
 * See: https://rclone.org/oracleobjectstorage/#authentication-providers
 */
function buildOciConfig(config: StorageConfig, profileName: string): string {
	return [
		`[${profileName}]`,
		`user=${config.user}`,
		`fingerprint=${config.fingerprint}`,
		`key_file=${config.keyFile}`,
		`tenancy=${config.tenancy}`,
		`region=${config.region}`,
		'',
	].join('\n');
}

/**
 * Build the rclone backend config pointing at the temporary OCI config file.
 * Uses the "user_principal_auth" provider so credentials come from that file.
 */
function buildRcloneConfig(config: StorageConfig, ociConfigPath: string, profileName: string): string {
	return [
		`[${config.remoteName}]`,
		`type = ${config.type}`,
		`namespace = ${config.namespace}`,
		`compartment = ${config.compartment}`,
		`region = ${config.region}`,
		'provider = user_principal_auth',
		`config_file = ${ociConfigPath}`,
		`config_profile = ${profileName}`,
		'',
	].join('\n');
}

export async function syncStorage(config: StorageConfig): Promise<void> {
	logger.info('Starting OCI file sync...');

	// Check if rclone is available
	if (!(await checkCommandAvailable('rclone'))) {
		throw new Error('rclone not found. Please install rclone.');
	}

	// Prepare temporary OCI config (no need for ~/.oci/config)
	logger.info('Building temporary OCI config...');
	const profileName = 'Default';
	const ociConfigFile = path.join(os.tmpdir(), `oci-env-sync-${Date.now()}.conf`);
	const ociConfigContent = buildOciConfig(config, profileName);
	writeFileSync(ociConfigFile, ociConfigContent);

	// Build rclone config pointing at the temporary OCI config
	logger.info('Building rclone config...');
	const rcloneConfig = buildRcloneConfig(config, ociConfigFile, profileName);
	const rcloneConfigFile = path.join(os.tmpdir(), `rclone-env-sync-${Date.now()}.conf`);
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

		// Remove the temporary OCI config file
		rmSync(ociConfigFile);
		rmSync(rcloneConfigFile);
	}
	catch (error) {
		logger.error(`OCI file sync failed: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
