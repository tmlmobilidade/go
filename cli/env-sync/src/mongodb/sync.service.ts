import type { SyncConfig } from '../config/config-loader.js';

import { existsSync, mkdirSync, readdirSync, rmSync, statSync, unlinkSync } from 'fs';
import path from 'path';

import { checkCommandAvailable } from '../utils/exec.js';
import { logger } from '../utils/logger.js';
import { saveBackupMetadata } from '../utils/metadata.js';
import { dumpMongoDB } from './dump.service.js';
import { restoreMongoDB } from './restore.service.js';

export interface MongoSyncOptions {
	backupOnly?: boolean
	skipCleanup?: boolean
	useReplicaSet?: boolean
}

export async function syncMongoDB(config: SyncConfig, options: MongoSyncOptions = {}): Promise<void> {
	const { backupOnly = false, skipCleanup = false, useReplicaSet } = options;

	logger.info(backupOnly ? 'Starting MongoDB backup...' : 'Starting MongoDB sync...');

	logger.verbose('Checking for MongoDB tools...');
	if (!(await checkCommandAvailable('mongodump'))) {
		throw new Error('mongodump not found. Please install MongoDB tools.');
	}
	logger.verbose('mongodump found');

	if (!backupOnly) {
		if (!(await checkCommandAvailable('mongorestore'))) {
			throw new Error('mongorestore not found. Please install MongoDB tools.');
		}
		logger.verbose('mongorestore found');
	}

	// Determine backup type
	const effectiveReplicaSet = useReplicaSet ?? false;
	const backupType = effectiveReplicaSet ? 'mongodb_rs' : 'mongodb';
	logger.verbose(`Backup type: ${backupType}`);
	logger.verbose(`Replica set mode: ${effectiveReplicaSet ? 'enabled' : 'disabled'}`);

	// Create backup directory
	const backupTimestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
	const dumpPath = path.join(config.backupDir, `${backupType}_${backupTimestamp}`);
	logger.verbose(`Backup directory: ${dumpPath}`);

	if (!existsSync(dumpPath)) {
		mkdirSync(dumpPath, { recursive: true });
	}

	// Dump production database
	logger.info('Dumping production database...');
	try {
		await dumpMongoDB({
			config: config.databaseProduction,
			excludeCollections: config.excludeCollections,
			outputPath: dumpPath,
			useReplicaSet: effectiveReplicaSet,
		});
	} catch (error) {
		logger.error(`Failed to dump production database: ${error instanceof Error ? error.message : String(error)}`);
		throw error;
	}

	if (!backupOnly) {
		logger.info('Restoring to staging database...');
		try {
			await restoreMongoDB({
				config: config.databaseStaging,
				dumpPath,
			});
		} catch (error) {
			logger.error(`Failed to restore to staging database: ${error instanceof Error ? error.message : String(error)}`);
			throw error;
		}
	}

	logger.verbose('Saving backup metadata...');
	saveBackupMetadata(config.backupDir, backupType, backupTimestamp);
	logger.verbose(`Backup metadata saved: ${backupType}_last_backup=${backupTimestamp}`);

	logger.success(backupOnly ? 'MongoDB backup completed successfully' : 'MongoDB sync completed successfully');

	// Cleanup old backups
	if (!skipCleanup) {
		logger.verbose(`Starting cleanup (retention: ${config.backupRetentionDays} days)...`);
		cleanupOldBackups(config.backupDir, config.backupRetentionDays);
	} else {
		logger.verbose('Cleanup skipped (--no-cleanup flag)');
	}
}

function cleanupOldBackups(backupDir: string, retentionDays: number): void {
	logger.info(`Cleaning up old backups (keeping last ${retentionDays} days)...`);

	if (!existsSync(backupDir)) {
		return;
	}

	const now = Date.now();
	const maxAge = retentionDays * 24 * 60 * 60 * 1000; // Convert days to milliseconds

	try {
		const entries = readdirSync(backupDir, { withFileTypes: true });

		for (const entry of entries) {
			if (entry.name === METADATA_FILE) continue; // Don't delete metadata file

			const entryPath = path.join(backupDir, entry.name);
			const stats = statSync(entryPath);
			const age = now - stats.mtimeMs;

			if (age > maxAge) {
				if (entry.isDirectory()) {
					rmSync(entryPath, { force: true, recursive: true });
					logger.info(`Deleted old backup directory: ${entry.name}`);
				} else {
					unlinkSync(entryPath);
					logger.info(`Deleted old backup file: ${entry.name}`);
				}
			}
		}

		logger.success('Cleanup completed');
	} catch (error) {
		logger.warn(`Cleanup failed: ${error instanceof Error ? error.message : String(error)}`);
	}
}

const METADATA_FILE = '.backup_metadata';
