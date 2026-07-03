import type { StorageConfig } from '../config/config-loader.js';

import { ZipArchive } from 'archiver';
import { createWriteStream, existsSync, readdirSync, rmSync, statSync, writeFileSync } from 'fs';
import os from 'os';
import path from 'path';

import { checkCommandAvailable, execCommandStream } from '../utils/exec.js';
import { logger } from '../utils/logger.js';

/**
 * Build a temporary OCI CLI config file using the credentials from StorageConfig.
 * This lets rclone use the "user_principal_auth" provider without needing ~/.oci/config.
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

export interface UploadArtifactsOptions {
	/** OCI bucket name to upload to */
	bucket: string
	/** Local directory containing artifacts to upload */
	localPath: string
	/** Optional prefix/folder within the bucket */
	prefix?: string
	/** Storage config with OCI credentials */
	storageConfig: StorageConfig
}

/**
 * Check if the directory is empty or has no files to upload
 */
function isDirectoryEmpty(dirPath: string): boolean {
	if (!existsSync(dirPath)) {
		return true;
	}

	const stats = statSync(dirPath);
	if (!stats.isDirectory()) {
		return false;
	}

	const entries = readdirSync(dirPath);
	// Filter out hidden files like .backup_metadata
	const files = entries.filter((entry) => {
		const entryPath = path.join(dirPath, entry);
		const entryStats = statSync(entryPath);
		return entryStats.isFile();
	});

	return files.length === 0;
}

/**
 * Create a zip archive of the backup directory using archiver
 */
async function createZipArchive(sourceDir: string, outputPath: string): Promise<void> {
	logger.info(`Creating zip archive: ${outputPath}`);

	return new Promise((resolve, reject) => {
		const output = createWriteStream(outputPath);
		const archive = new ZipArchive({
			zlib: { level: 9 }, // Maximum compression
		});

		// Listen for all archive data to be written
		output.on('close', () => {
			logger.verbose(`Zip archive created successfully: ${outputPath} (${archive.pointer()} bytes)`);
			resolve();
		});

		// Catch warnings (e.g., stat failures and other non-blocking errors)
		archive.on('warning', (err) => {
			if (err.code === 'ENOENT') {
				logger.verbose(`Archive warning: ${err.message}`);
			} else {
				reject(err);
			}
		});

		// Catch errors
		archive.on('error', (err) => {
			reject(new Error(`Failed to create zip archive: ${err.message}`));
		});

		// Pipe archive data to the file
		archive.pipe(output);

		// Append the entire directory to the archive
		const folderName = path.basename(sourceDir);
		archive.directory(sourceDir, folderName);

		// Finalize the archive (i.e., we are done appending files)
		archive.finalize();
	});
}

/**
 * Upload artifacts (backups) to OCI Object Storage bucket.
 * This replaces the GitHub artifacts upload for security in public repos.
 * The backup folder is zipped before uploading to reduce size and upload time.
 */
export async function uploadArtifacts(options: UploadArtifactsOptions): Promise<void> {
	const { bucket, localPath, prefix, storageConfig } = options;

	logger.info('Starting artifact upload to OCI Object Storage...');

	// Check if local path exists
	if (!existsSync(localPath)) {
		logger.warn(`Artifact path does not exist: ${localPath}`);
		logger.info('No artifacts to upload.');
		return;
	}

	// Check if directory is empty
	if (isDirectoryEmpty(localPath)) {
		logger.warn(`Artifact directory is empty: ${localPath}`);
		logger.info('No artifacts to upload.');
		return;
	}

	// Check if rclone is available
	if (!(await checkCommandAvailable('rclone'))) {
		throw new Error('rclone not found. Please install rclone.');
	}

	// Create zip archive
	const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
	const zipFileName = `backups-${timestamp}.zip`;
	const zipFilePath = path.join(os.tmpdir(), zipFileName);
	let zipCreated = false;

	try {
		await createZipArchive(localPath, zipFilePath);
		zipCreated = true;
		if (existsSync(zipFilePath)) {
			const zipSizeMB = Math.round(statSync(zipFilePath).size / 1024 / 1024 * 100) / 100;
			logger.info(`Zip archive created: ${zipFileName} (${zipSizeMB} MB)`);
		} else {
			logger.info(`Zip archive created: ${zipFileName}`);
		}
	} catch (error) {
		logger.error(`Failed to create zip archive: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}

	// Prepare temporary OCI config
	logger.info('Building temporary OCI config...');
	const profileName = 'Default';
	const ociConfigFile = path.join(os.tmpdir(), `oci-artifacts-${Date.now()}.conf`);
	const ociConfigContent = buildOciConfig(storageConfig, profileName);
	writeFileSync(ociConfigFile, ociConfigContent);

	// Build rclone config pointing at the temporary OCI config
	logger.info('Building rclone config...');
	const rcloneConfig = buildRcloneConfig(storageConfig, ociConfigFile, profileName);
	const rcloneConfigFile = path.join(os.tmpdir(), `rclone-artifacts-${Date.now()}.conf`);
	writeFileSync(rcloneConfigFile, rcloneConfig);

	// Build the destination path
	const destFolder = prefix ?? '';
	const destPath = `${storageConfig.remoteName}:${bucket}/${destFolder}`;

	logger.info(`Uploading zip archive to: ${destPath}`);

	// Use rclone copy to upload the zip file
	const baseCmd = `rclone copy "${zipFilePath}" "${destPath}/" --config ${rcloneConfigFile}`;
	const verboseFlags = logger.isVerbose() ? ' --progress --verbose' : '';
	const copyCmd = `${baseCmd}${verboseFlags}`;

	try {
		await execCommandStream(copyCmd);
		logger.success(`Artifacts uploaded successfully to: ${destPath}/${zipFileName}`);

		// Clean up temporary files
		rmSync(ociConfigFile);
		rmSync(rcloneConfigFile);
		if (zipCreated && existsSync(zipFilePath)) {
			rmSync(zipFilePath);
			logger.verbose('Temporary zip file cleaned up');
		}
	} catch (error) {
		// Clean up on error too
		if (existsSync(ociConfigFile)) rmSync(ociConfigFile);
		if (existsSync(rcloneConfigFile)) rmSync(rcloneConfigFile);
		if (zipCreated && existsSync(zipFilePath)) {
			rmSync(zipFilePath);
		}

		logger.error(`Artifact upload failed: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}
}
