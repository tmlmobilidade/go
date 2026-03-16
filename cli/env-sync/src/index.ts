#!/usr/bin/env node

import type { SyncConfig } from './config/config-loader.js';

import { cancel, isCancel, multiselect, outro, spinner } from '@clack/prompts';
import { ASCII_TMLMOBILIDADE } from '@tmlmobilidade/consts';
import chalk from 'chalk';

import { uploadArtifacts } from './artifacts/upload.service.js';
import { parseArgs, showHelp } from './cli/commands.js';
import { loadConfig } from './config/config-loader.js';
import { syncMongoDB } from './mongodb/sync.service.js';
import { syncStorageService } from './storage/sync.service.js';
import { logger } from './utils/logger.js';

/* * */

export const renderTitle = () => {
	let text = ASCII_TMLMOBILIDADE;

	text = text.replace(/▓/g, chalk.dim(chalk.yellow('▓')));
	text = text.replace(/ ▄▄▄ /g, chalk.yellow(' ▄▄▄ '));
	text = text.replace(/ ▀▀▀ /g, chalk.yellow(' ▀▀▀ '));
	text = text.replace(/▐▒▒▒▌/g, chalk.yellow('▐') + chalk.white('▒▒▒') + chalk.yellow('▌'));

	console.log(text);
};

interface SyncTargets {
	backupOnly: boolean
	syncDb: boolean
	syncStorage: boolean
}

async function determineSyncTargets(options: ReturnType<typeof parseArgs>): Promise<SyncTargets> {
	// --backup-only: only dump the database, skip storage and restore
	if (options.backupOnly) {
		return {
			backupOnly: true,
			syncDb: true,
			syncStorage: false,
		};
	}

	// If only --upload-artifacts is provided, skip sync operations
	if (options.uploadArtifacts && !options.dbOnly && !options.storageOnly) {
		return {
			backupOnly: false,
			syncDb: false,
			syncStorage: false,
		};
	}

	// If flags are provided, use them (non-interactive mode)
	if (options.dbOnly || options.storageOnly) {
		return {
			backupOnly: false,
			syncDb: Boolean(options.dbOnly),
			syncStorage: Boolean(options.storageOnly),
		};
	}

	// Interactive mode: ask user what to sync
	const syncOptions = await multiselect({
		message: 'What would you like to do?',
		options: [
			{
				hint: 'Dump MongoDB database only (no restore to staging)',
				label: 'Backup only',
				value: 'backup',
			},
			{
				hint: 'Sync MongoDB database from production to staging',
				label: 'Database',
				value: 'database',
			},
			{
				hint: 'Sync OCI storage files from production to staging',
				label: 'Storage',
				value: 'storage',
			},
		],
		required: true,
	});

	if (isCancel(syncOptions)) {
		cancel('Operation cancelled');
		process.exit(0);
	}

	const selected = syncOptions as string[];
	const isBackupOnly = selected.includes('backup');

	return {
		backupOnly: isBackupOnly,
		syncDb: isBackupOnly || selected.includes('database'),
		syncStorage: !isBackupOnly && selected.includes('storage'),
	};
}

async function runStorageSync(config: SyncConfig): Promise<void> {
	const s = spinner();
	s.start('Syncing storage...');

	try {
		await syncStorageService(config);
		s.stop('Storage sync completed successfully');
	} catch (error) {
		s.stop('Storage sync failed');
		logger.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

async function runDatabaseSync(config: SyncConfig, options: ReturnType<typeof parseArgs>): Promise<void> {
	const backupOnly = options.backupOnly || false;
	const s = spinner();
	s.start(backupOnly ? 'Backing up database...' : 'Syncing database...');

	try {
		await syncMongoDB(config, {
			backupOnly,
			skipCleanup: options.noCleanup || false,
			useReplicaSet: options.replicaSet,
		});
		s.stop(backupOnly ? 'Database backup completed successfully' : 'Database sync completed successfully');
	} catch (error) {
		s.stop(backupOnly ? 'Database backup failed' : 'Database sync failed');
		logger.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

async function runArtifactUpload(config: SyncConfig): Promise<void> {
	const s = spinner();
	s.start('Uploading artifacts to OCI...');

	try {
		if (!config.artifacts.bucket) {
			throw new Error('ARTIFACTS_BUCKET is not configured. Please set it in your .env file.');
		}

		await uploadArtifacts({
			bucket: config.artifacts.bucket,
			localPath: config.backupDir,
			prefix: config.artifacts.prefix,
			storageConfig: config.storage,
		});
		s.stop('Artifacts uploaded successfully');
	} catch (error) {
		s.stop('Artifact upload failed');
		logger.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

async function main() {
	const args = process.argv.slice(2);
	const options = parseArgs(args);

	if (options.help) {
		showHelp();
		process.exit(0);
	}

	try {
		renderTitle();

		// Set verbose mode
		if (options.verbose) {
			logger.setVerbose(true);
			logger.verbose('Verbose mode enabled');
		}

		// Load configuration
		const config = loadConfig(options.envFile);
		logger.verbose('Configuration loaded successfully');

		const { backupOnly, syncDb, syncStorage } = await determineSyncTargets(options);

		if (syncStorage) {
			await runStorageSync(config);
		}

		if (syncDb) {
			await runDatabaseSync(config, { ...options, backupOnly });
		}

		if (options.uploadArtifacts) {
			await runArtifactUpload(config);
		}

		if (syncDb || syncStorage || options.uploadArtifacts) {
			const message = backupOnly ? 'Database backup completed successfully!' : 'Environment sync completed successfully!';
			outro(message);
		}
	} catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);
		} else {
			logger.error(String(error));
		}
		process.exit(1);
	}
}

main().catch((error) => {
	logger.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
});
