#!/usr/bin/env node

import type { SyncConfig } from './config/config-loader.js';

import { cancel, isCancel, multiselect, outro, spinner } from '@clack/prompts';
import { ASCII_TMLMOBILIDADE } from '@tmlmobilidade/consts';
import chalk from 'chalk';

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
	syncDb: boolean
	syncStorage: boolean
}

async function determineSyncTargets(options: ReturnType<typeof parseArgs>): Promise<SyncTargets> {
	// If flags are provided, use them (non-interactive mode)
	if (options.dbOnly || options.storageOnly) {
		return {
			syncDb: Boolean(options.dbOnly),
			syncStorage: Boolean(options.storageOnly),
		};
	}

	// Interactive mode: ask user what to sync
	const syncOptions = await multiselect({
		message: 'What would you like to sync?',
		options: [
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

	return {
		syncDb: selected.includes('database'),
		syncStorage: selected.includes('storage'),
	};
}

async function runStorageSync(config: SyncConfig): Promise<void> {
	const s = spinner();
	s.start('Syncing storage...');

	try {
		await syncStorageService(config);
		s.stop('Storage sync completed successfully');
	}
	catch (error) {
		s.stop('Storage sync failed');
		logger.error(error instanceof Error ? error.message : String(error));
		process.exit(1);
	}
}

async function runDatabaseSync(config: SyncConfig, options: ReturnType<typeof parseArgs>): Promise<void> {
	const s = spinner();
	s.start('Syncing database...');

	try {
		await syncMongoDB(config, {
			skipCleanup: options.noCleanup || false,
			useReplicaSet: options.replicaSet,
		});
		s.stop('Database sync completed successfully');
	}
	catch (error) {
		s.stop('Database sync failed');
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
		const config = loadConfig();
		logger.verbose('Configuration loaded successfully');

		const { syncDb, syncStorage } = await determineSyncTargets(options);

		if (syncStorage) {
			await runStorageSync(config);
		}

		if (syncDb) {
			await runDatabaseSync(config, options);
		}

		outro('Environment sync completed successfully!');
	}
	catch (error) {
		if (error instanceof Error) {
			logger.error(error.message);
		}
		else {
			logger.error(String(error));
		}
		process.exit(1);
	}
}

main().catch((error) => {
	logger.error(`Unexpected error: ${error instanceof Error ? error.message : String(error)}`);
	process.exit(1);
});
