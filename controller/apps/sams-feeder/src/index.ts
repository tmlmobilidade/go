/* * */

import { parseSam } from '@/parse-sam.js';
import { type AggregationResultItem } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { sams, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to the relevant collections.

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// Prepare the agregation pipeline to extract all unique SAM Serial Numbers
		// from simplified Apex Transactions. The pipeline is common to all transaction types.

		const agregationPipeline = [
			{ $match: { agency_id: { $in: ['44'] } } },
			{ $group: { _id: { agency_id: '$agency_id', mac_sam_serial_number: '$mac_sam_serial_number' } } },
			{ $project: { _id: false, agency_id: '$_id.agency_id', mac_sam_serial_number: '$_id.mac_sam_serial_number' } },
		];

		/* * */
		/* SIMPLIFIED APEX LOCATIONS */

		LOGGER.info('Adding SAMs from Simplified APEX Locations...');

		const samsForLocationsTimer = new TIMETRACKER();

		let samsForLocationsCounter = 0;

		const allSamsForApexLocations = simplifiedApexLocationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexLocations) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
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

		LOGGER.success(`Added ${samsForLocationsCounter} Unique SAMs from Simplified APEX Locations. (${samsForLocationsTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX ON BOARD REFUNDS */

		LOGGER.info('Adding SAMs from Simplified APEX On Board Refunds...');

		const samsForOnBoardRefundsTimer = new TIMETRACKER();

		let samsForOnBoardRefundsCounter = 0;

		const allSamsForApexOnBoardRefunds = simplifiedApexOnBoardRefundsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexOnBoardRefunds) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
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

		LOGGER.success(`Added ${samsForOnBoardRefundsCounter} Unique SAMs from Simplified APEX OnBoardRefunds. (${samsForOnBoardRefundsTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX ON BOARD SALES */

		LOGGER.info('Adding SAMs from Simplified APEX On Board Sales...');

		const samsForOnBoardSalesTimer = new TIMETRACKER();

		let samsForOnBoardSalesCounter = 0;

		const allSamsForApexOnBoardSales = simplifiedApexOnBoardSalesCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexOnBoardSales) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
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

		LOGGER.success(`Added ${samsForOnBoardSalesCounter} Unique SAMs from Simplified APEX OnBoardSales. (${samsForOnBoardSalesTimer.get()})`, 1);

		/* * */
		/* SIMPLIFIED APEX VALIDATIONS */

		LOGGER.info('Adding SAMs from Simplified APEX Validations...');

		const samsForValidationsTimer = new TIMETRACKER();

		let samsForValidationsCounter = 0;

		const allSamsForApexValidations = simplifiedApexValidationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allSamsForApexValidations) {
			// Set the type of item
			const itemData = item as AggregationResultItem;
			// Validate if the SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
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

		LOGGER.success(`Added ${samsForValidationsCounter} SAMs from Simplified APEX Validations. (${samsForValidationsTimer.get()})`, 1);

		//

		LOGGER.terminate(`Run took ${globalTimer.get()}`);

		//
	}
	catch (error) {
		LOGGER.error('An error occurred. Halting execution.', error);
		LOGGER.error('Retrying in 10 seconds...');
		setTimeout(() => {
			process.exit(0); // End process
		}, 10000); // after 10 seconds
	}
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await main();
		setTimeout(runOnInterval, 43_200_000); // 12 hours
	};
	runOnInterval();
})();
