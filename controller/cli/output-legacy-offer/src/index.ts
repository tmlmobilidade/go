#!/usr/bin/env node

/* * */

import { generateOfferOutput } from '@/main.js';
import LOGGER from '@helperkits/logger';
import { validateOperationalDate } from '@tmlmobilidade/types';
import { Command } from 'commander';
import fs from 'fs';

/* * */

(async function init() {
	//

	//
	// Setup the program options

	const program = new Command();

	program
		.name('Generate Offer Journeys')
		.description('Output offer_journey.json files from GTFS files.')
		.requiredOption('--file <path>', 'GTFS file path')
		.requiredOption('--start-date <operational-date>', 'The start date of the plan in YYYYMMDD format')
		.requiredOption('--end-date <operational-date>', 'The end date of the plan in YYYYMMDD format')
		.option('--output-dir <path>', 'Output directory for the offer_journey.json files', './output')
		.option('--override', 'Override output directory if it exists', false)
		.option('--feed-id <value>', 'Optional feedId value to include in output files', null)
		.parse();

	//
	// Validate the input options

	const options = program.opts();

	try {
		options.startDate = validateOperationalDate(options.startDate);
		options.endDate = validateOperationalDate(options.endDate);
	}
	catch (error) {
		LOGGER.divider();
		LOGGER.error(`--start-date and/or --end-date are not valid:`, error.message);
		LOGGER.divider();
		return;
	}

	//
	// Ensure the output directory exists and is empty

	if (fs.existsSync(options.outputDir) && !options.override) {
		LOGGER.divider();
		LOGGER.error(`Output directory "${options.outputDir}" already exists. Please remove it or change it before running the script.`);
		LOGGER.divider();
		return;
	}

	if (fs.existsSync(options.outputDir) && options.override) {
		LOGGER.info(`Output directory "${options.outputDir}" already exists. It will be overridden.`);
		fs.rmSync(options.outputDir, { recursive: true });
	}

	fs.mkdirSync(options.outputDir, { recursive: true });

	//
	// Start the offer generation process

	await generateOfferOutput(options.file, options.startDate, options.endDate, options.outputDir, options.feedId);

	//
})();
