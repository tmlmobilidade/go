#!/usr/bin/env node

import type { FetchConfig } from './config/config-loader.js';

import { outro, spinner } from '@clack/prompts';
import { ASCII_TMLMOBILIDADE } from '@tmlmobilidade/consts';
import chalk from 'chalk';
import { existsSync, mkdirSync } from 'fs';
import path from 'path';

import { parseArgs, showHelp } from './cli/commands.js';
import { loadConfig } from './config/config-loader.js';
import { fetchRidesData } from './services/fetch.service.js';
import { logger } from './utils/logger.js';
import { createZipFile, type ZipFile } from './utils/zip.js';

/* * */

export const renderTitle = () => {
	let text = ASCII_TMLMOBILIDADE;

	text = text.replace(/▓/g, chalk.dim(chalk.yellow('▓')));
	text = text.replace(/ ▄▄▄ /g, chalk.yellow(' ▄▄▄ '));
	text = text.replace(/ ▀▀▀ /g, chalk.yellow(' ▀▀▀ '));
	text = text.replace(/▐▒▒▒▌/g, chalk.yellow('▐') + chalk.white('▒▒▒') + chalk.yellow('▌'));

	console.log(text);
};

async function createJsonFiles(
	data: Awaited<ReturnType<typeof fetchRidesData>>,
	includeVehicleEvents: boolean,
	outputDir: string,
): Promise<ZipFile[]> {
	const files: ZipFile[] = [];

	// Create rides.json
	const ridesJson = JSON.stringify(data.rides, null, 2);
	files.push({
		content: ridesJson,
		name: 'rides.json',
	});
	logger.verbose(`Prepared rides.json (${ridesJson.length} bytes)`);

	// Create hashed_trips.json
	const hashedTripsJson = JSON.stringify(data.hashedTrips, null, 2);
	files.push({
		content: hashedTripsJson,
		name: 'hashed_trips.json',
	});
	logger.verbose(`Prepared hashed_trips.json (${hashedTripsJson.length} bytes)`);

	// Create hashed_shapes.json
	const hashedShapesJson = JSON.stringify(data.hashedShapes, null, 2);
	files.push({
		content: hashedShapesJson,
		name: 'hashed_shapes.json',
	});
	logger.verbose(`Prepared hashed_shapes.json (${hashedShapesJson.length} bytes)`);

	// Create vehicle-events.json if requested
	if (includeVehicleEvents) {
		const vehicleEventsJson = JSON.stringify(data.vehicleEvents, null, 2);
		files.push({
			content: vehicleEventsJson,
			name: 'vehicle-events.json',
		});
		logger.verbose(`Prepared vehicle-events.json (${vehicleEventsJson.length} bytes)`);
	}

	return files;
}

async function runFetchRides(config: FetchConfig, options: ReturnType<typeof parseArgs>): Promise<void> {
	const s = spinner();
	s.start('Fetching rides data...');

	try {
		const data = await fetchRidesData(config, options);
		s.stop('Data fetched successfully');

		if (data.rides.length === 0) {
			logger.warn('No rides found. Exiting without creating zip file.');
			return;
		}

		// Prepare output directory
		const outputDir = options.output || path.join(config.scriptDir, 'exports');
		if (!existsSync(outputDir)) {
			mkdirSync(outputDir, { recursive: true });
			logger.verbose(`Created output directory: ${outputDir}`);
		}

		// Create JSON files
		s.start('Preparing JSON files...');
		const jsonFiles = await createJsonFiles(data, Boolean(options.includeVehicleEvents), outputDir);
		s.stop('JSON files prepared');

		// Create zip file
		const timestamp = new Date().toISOString().replace(/[:.]/g, '-').replace('T', '_').substring(0, 19);
		const zipFileName = `rides-export-${timestamp}.zip`;

		s.start('Creating zip file...');
		const zipPath = await createZipFile(jsonFiles, outputDir, zipFileName);
		s.stop('Zip file created');

		logger.success(`Export completed: ${zipPath}`);
		logger.info(`Exported ${data.rides.length} rides, ${data.hashedTrips.length} hashed trips, ${data.hashedShapes.length} hashed shapes${options.includeVehicleEvents ? `, ${data.vehicleEvents.length} vehicle events` : ''}`);
	}
	catch (error) {
		s.stop('Fetch failed');
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

		// Validate required options
		if (!options.startDate || !options.endDate) {
			logger.error('Both --start-date and --end-date are required');
			showHelp();
			process.exit(1);
		}

		// Load configuration
		const config = loadConfig();
		logger.verbose('Configuration loaded successfully');

		// Run fetch
		await runFetchRides(config, options);

		outro('Rides export completed successfully!');
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

