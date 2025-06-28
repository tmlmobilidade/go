/* * */

import { parseUniqueSam } from '@/parse-unique-sam.js';
import { type AggregationResult } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, uniqueSams } from '@tmlmobilidade/interfaces';

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
			{
				$match: {
					agency_id: { $in: ['44'] },
				},
			},
			{
				$group: {
					_id: {
						agency_id: '$agency_id',
						device_id: '$device_id',
						mac_sam_serial_number: '$mac_sam_serial_number',
					},
				},
			},
			{
				$project: {
					_id: false,
					agency_id: '$_id.agency_id',
					device_id: '$_id.device_id',
					mac_sam_serial_number: '$_id.mac_sam_serial_number',
				},
			},
		];

		/* * */
		/* SIMPLIFIED APEX LOCATIONS */

		LOGGER.title('Adding Unique SAMs from Simplified Apex Locations');

		const uniqueSamsForLocationsTimer = new TIMETRACKER();

		let uniqueSamsForLocationsCounter = 0;

		const allUniqueSamsForApexLocations = simplifiedApexLocationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexLocations) {
			// Set the type of item
			const itemData = item as AggregationResult;
			// Validate if the Unique SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for Unique SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the Unique SAM already exists
			const uniqueSamAlreadyExists = await uniqueSams.existsById(itemData.mac_sam_serial_number);
			if (uniqueSamAlreadyExists) continue;
			// Parse the Unique SAM data
			const parsedUniqueSam = parseUniqueSam(item);
			// Create a new Unique SAM document
			await uniqueSams.updateById(itemData.mac_sam_serial_number, parsedUniqueSam, { upsert: true });
			// Increment the counter
			uniqueSamsForLocationsCounter++;
		}

		LOGGER.success(`Added ${uniqueSamsForLocationsCounter} Unique SAMs from Simplified Apex Locations. (${uniqueSamsForLocationsTimer.get()})`);

		/* * */
		/* SIMPLIFIED APEX ON BOARD REFUNDS */

		LOGGER.title('Adding Unique SAMs from Simplified Apex On Board Refunds');

		const uniqueSamsForOnBoardRefundsTimer = new TIMETRACKER();

		let uniqueSamsForOnBoardRefundsCounter = 0;

		const allUniqueSamsForApexOnBoardRefunds = simplifiedApexOnBoardRefundsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexOnBoardRefunds) {
			// Set the type of item
			const itemData = item as AggregationResult;
			// Validate if the Unique SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for Unique SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the Unique SAM already exists
			const uniqueSamAlreadyExists = await uniqueSams.existsById(itemData.mac_sam_serial_number);
			if (uniqueSamAlreadyExists) continue;
			// Parse the Unique SAM data
			const parsedUniqueSam = parseUniqueSam(item);
			// Create a new Unique SAM document
			await uniqueSams.updateById(itemData.mac_sam_serial_number, parsedUniqueSam, { upsert: true });
			// Increment the counter
			uniqueSamsForOnBoardRefundsCounter++;
		}

		LOGGER.success(`Added ${uniqueSamsForOnBoardRefundsCounter} Unique SAMs from Simplified Apex OnBoardRefunds. (${uniqueSamsForOnBoardRefundsTimer.get()})`);

		/* * */
		/* SIMPLIFIED APEX ON BOARD SALES */

		LOGGER.title('Adding Unique SAMs from Simplified Apex On Board Sales');

		const uniqueSamsForOnBoardSalesTimer = new TIMETRACKER();

		let uniqueSamsForOnBoardSalesCounter = 0;

		const allUniqueSamsForApexOnBoardSales = simplifiedApexOnBoardSalesCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexOnBoardSales) {
			// Set the type of item
			const itemData = item as AggregationResult;
			// Validate if the Unique SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for Unique SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the Unique SAM already exists
			const uniqueSamAlreadyExists = await uniqueSams.existsById(itemData.mac_sam_serial_number);
			if (uniqueSamAlreadyExists) continue;
			// Parse the Unique SAM data
			const parsedUniqueSam = parseUniqueSam(item);
			// Create a new Unique SAM document
			await uniqueSams.updateById(itemData.mac_sam_serial_number, parsedUniqueSam, { upsert: true });
			// Increment the counter
			uniqueSamsForOnBoardSalesCounter++;
		}

		LOGGER.success(`Added ${uniqueSamsForOnBoardSalesCounter} Unique SAMs from Simplified Apex OnBoardSales. (${uniqueSamsForOnBoardSalesTimer.get()})`);

		/* * */
		/* SIMPLIFIED APEX VALIDATIONS */

		LOGGER.title('Adding Unique SAMs from Simplified Apex Validations');

		const uniqueSamsForValidationsTimer = new TIMETRACKER();

		let uniqueSamsForValidationsCounter = 0;

		const allUniqueSamsForApexValidations = simplifiedApexValidationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexValidations) {
			// Set the type of item
			const itemData = item as AggregationResult;
			// Validate if the Unique SAM Serial Number is a number
			if (typeof itemData.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Expected a number for Unique SAM Serial Number: "${itemData.mac_sam_serial_number}"`);
				continue;
			}
			// Skip if the Unique SAM already exists
			const uniqueSamAlreadyExists = await uniqueSams.existsById(itemData.mac_sam_serial_number);
			if (uniqueSamAlreadyExists) continue;
			// Parse the Unique SAM data
			const parsedUniqueSam = parseUniqueSam(item);
			// Create a new Unique SAM document
			await uniqueSams.updateById(itemData.mac_sam_serial_number, parsedUniqueSam, { upsert: true });
			// Increment the counter
			uniqueSamsForValidationsCounter++;
		}

		LOGGER.success(`Added ${uniqueSamsForValidationsCounter} Unique SAMs from Simplified Apex Validations. (${uniqueSamsForValidationsTimer.get()})`);

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
		setTimeout(runOnInterval, 60_000); // 1 minute
	};
	runOnInterval();
})();
