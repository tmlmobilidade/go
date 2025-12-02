#!/usr/bin/env node

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

		// Determine what to sync
		let syncDb = false;
		let syncStorage = false;

		// If flags are provided, use them
		if (options.dbOnly) {
			syncDb = true;
		}
		else if (options.storageOnly) {
			syncStorage = true;
		}
		else {
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
			syncDb = selected.includes('database');
			syncStorage = selected.includes('storage');
		}

		// Sync storage
		if (syncStorage) {
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

		// Sync database
		if (syncDb) {
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
