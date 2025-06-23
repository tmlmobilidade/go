#!/usr/bin/env node

/* * */

import { generateOfferOutput } from '@/main.js';
import LOGGER from '@helperkits/logger';
import { validateOperationalDate } from '@tmlmobilidade/types';
import { Command } from 'commander';

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

	await generateOfferOutput(options.file, options.startDate, options.endDate);

	//
})();
