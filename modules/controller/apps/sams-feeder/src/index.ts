/* * */

import { parseSam } from '@/parse-sam.js';
import { type AggregationResultItem } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { sams, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'sams-feeder', message: 'Sentry Sams Feeder initialized', module: 'controller', severity: 'info' });
		} catch (error) {
			Logger.error('Error initializing Sentry Sams Feeder', { app: 'sams-feeder', message: 'Error initializing Sentry Sams Feeder', module: 'controller', severity: 'error', value: error });
		}

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to the relevant collections.

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// Prepare the agregation pipeline to extract all unique SAM Serial Numbers
		// from simplified Apex Transactions. The pipeline is common to all transaction types.

		const searchTimestampStart = Dates
			.now('Europe/Lisbon')
			.startOf('day')
			.set({ day: 1, hour: 4, minute: 0, month: 1, year: 2025 })
			.unix_timestamp;

		const agregationPipeline = [
			{ $match: { agency_id: { $in: ['41', '42', '43', '44'] }, created_at: { $gte: searchTimestampStart } } },
			{ $group: { _id: { agency_id: '$agency_id', mac_sam_serial_number: '$mac_sam_serial_number' } } },
			{ $project: { _id: false, agency_id: '$_id.agency_id', mac_sam_serial_number: '$_id.mac_sam_serial_number' } },
		];

		/* * */
		/* SIMPLIFIED APEX LOCATIONS */

		Logger.info('Adding SAMs from Simplified APEX Locations...');

		const samsForLocationsTimer = new Timer();

		let samsForLocationsCounter = 0;

		const allSamsForApexLocations = simplifiedApexLocationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexLocations) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				Logger.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the SAM already exists
			const samAlreadyExists = await sams.existsById(itemData.mac_sam_serial_number);
			if (samAlreadyExists) continue;
			// Parse the SAM data
			const parsedSam = parseSam(item);
			// Create a new SAM document
			await sams.updateById(itemData.mac_sam_serial_number, parsedSam, { upsert: true });
			// Increment the counter
			samsForLocationsCounter++;
		}

		Logger.success(`Added ${samsForLocationsCounter} Unique SAMs from Simplified APEX Locations. (${samsForLocationsTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX ON BOARD REFUNDS */

		Logger.info('Adding SAMs from Simplified APEX On Board Refunds...');

		const samsForOnBoardRefundsTimer = new Timer();

		let samsForOnBoardRefundsCounter = 0;

		const allSamsForApexOnBoardRefunds = simplifiedApexOnBoardRefundsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexOnBoardRefunds) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				Logger.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the SAM already exists
			const samAlreadyExists = await sams.existsById(itemData.mac_sam_serial_number);
			if (samAlreadyExists) continue;
			// Parse the SAM data
			const parsedSam = parseSam(item);
			// Create a new SAM document
			await sams.updateById(itemData.mac_sam_serial_number, parsedSam, { upsert: true });
			// Increment the counter
			samsForOnBoardRefundsCounter++;
		}

		Logger.success(`Added ${samsForOnBoardRefundsCounter} Unique SAMs from Simplified APEX OnBoardRefunds. (${samsForOnBoardRefundsTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX ON BOARD SALES */

		Logger.info('Adding SAMs from Simplified APEX On Board Sales...');

		const samsForOnBoardSalesTimer = new Timer();

		let samsForOnBoardSalesCounter = 0;

		const allSamsForApexOnBoardSales = simplifiedApexOnBoardSalesCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexOnBoardSales) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				Logger.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the SAM already exists
			const samAlreadyExists = await sams.existsById(itemData.mac_sam_serial_number);
			if (samAlreadyExists) continue;
			// Parse the SAM data
			const parsedSam = parseSam(item);
			// Create a new SAM document
			await sams.updateById(itemData.mac_sam_serial_number, parsedSam, { upsert: true });
			// Increment the counter
			samsForOnBoardSalesCounter++;
		}

		Logger.success(`Added ${samsForOnBoardSalesCounter} Unique SAMs from Simplified APEX OnBoardSales. (${samsForOnBoardSalesTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX VALIDATIONS */

		Logger.info('Adding SAMs from Simplified APEX Validations...');

		const samsForValidationsTimer = new Timer();

		let samsForValidationsCounter = 0;

		const allSamsForApexValidations = simplifiedApexValidationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexValidations) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				Logger.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the SAM already exists
			const samAlreadyExists = await sams.existsById(itemData.mac_sam_serial_number);
			if (samAlreadyExists) continue;
			// Parse the SAM data
			const parsedSam = parseSam(item);
			// Create a new SAM document
			await sams.updateById(itemData.mac_sam_serial_number, parsedSam, { upsert: true });
			// Increment the counter
			samsForValidationsCounter++;
		}

		Logger.success(`Added ${samsForValidationsCounter} SAMs from Simplified APEX Validations. (${samsForValidationsTimer.get()})`, 1);

		//

		Logger.terminate(`Run took ${globalTimer.get()}`);

		//
	} catch (error) {
		Logger.error('An error occurred. Halting execution.', error);
		Logger.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(1); // End process
		}, 10000); // after 10 seconds
	}
};

/* * */

await runOnInterval(main, { intervalMs: '12h' });
