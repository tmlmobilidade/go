/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, uniqueSams } from '@tmlmobilidade/interfaces';

/* * */

const RUN_INTERVAL = 60000; // 1 minute

/* * */

async function createUniqueSamsFromSimplifiedApexTransactions() {
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
					agency_id: '44',
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

		//
		// Get all unique SAM Serial Numbers from each Simplified Apex Transaction type.
		// Check if the unique SAM Serial Number already exists in the database.

		const uniqueSamsForLocationsTimer = new TIMETRACKER();

		let uniqueSamsForLocationsCounter = 0;

		const allUniqueSamsForApexLocations = simplifiedApexLocationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexLocations) {
			if (typeof item.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Invalid Unique SAM Serial Number: ${item.mac_sam_serial_number}. Expected a number.`);
				continue;
			}
			// Check if the Unique SAM Serial Number already exists in the database.
			const existingUniqueSam = await uniqueSams.findById(item.mac_sam_serial_number);
			// Validate if the Unique SAM Serial Number is not already registered for the same agency and device.
			if (existingUniqueSam) {
				// Validate if this Unique SAM matches the agency and device.
				if (existingUniqueSam.agency_id !== item.agency_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different agency.`);
				if (existingUniqueSam.device_id !== item.device_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different device.`);
				// If it matches, skip to the next item.
				continue;
			}
			// Create a new Unique SAM document.
			await uniqueSams.insertOne({
				_id: item.mac_sam_serial_number,
				agency_id: item.agency_id,
				device_id: item.device_id,
				latest_apex_version: null,
				seen_first_at: null,
				seen_last_at: null,
				status: 'pending',
				status_message: null,
				transactions_expected: null,
				transactions_found: null,
				transactions_missing: null,
			});
			// Increment the counter
			uniqueSamsForLocationsCounter++;
		}

		LOGGER.info(`Added ${uniqueSamsForLocationsCounter} Unique SAMs from Simplified Apex Locations. (${uniqueSamsForLocationsTimer.get()})`);

		//

		const uniqueSamsForOnBoardRefundsTimer = new TIMETRACKER();

		let uniqueSamsForOnBoardRefundsCounter = 0;

		const allUniqueSamsForApexOnBoardRefunds = simplifiedApexOnBoardRefundsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexOnBoardRefunds) {
			if (typeof item.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Invalid Unique SAM Serial Number: ${item.mac_sam_serial_number}. Expected a number.`);
				continue;
			}
			// Check if the Unique SAM Serial Number already exists in the database.
			const existingUniqueSam = await uniqueSams.findById(item.mac_sam_serial_number);
			// Validate if the Unique SAM Serial Number is not already registered for the same agency and device.
			if (existingUniqueSam) {
				// Validate if this Unique SAM matches the agency and device.
				if (existingUniqueSam.agency_id !== item.agency_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different agency.`);
				if (existingUniqueSam.device_id !== item.device_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different device.`);
				// If it matches, skip to the next item.
				continue;
			}
			// Create a new Unique SAM document.
			await uniqueSams.insertOne({
				_id: item.mac_sam_serial_number,
				agency_id: item.agency_id,
				device_id: item.device_id,
				latest_apex_version: null,
				seen_first_at: null,
				seen_last_at: null,
				status: 'pending',
				status_message: null,
				transactions_expected: null,
				transactions_found: null,
				transactions_missing: null,
			});
			// Increment the counter
			uniqueSamsForOnBoardRefundsCounter++;
		}

		LOGGER.info(`Added ${uniqueSamsForOnBoardRefundsCounter} Unique SAMs from Simplified Apex OnBoardRefunds. (${uniqueSamsForOnBoardRefundsTimer.get()})`);

		//

		const uniqueSamsForOnBoardSalesTimer = new TIMETRACKER();

		let uniqueSamsForOnBoardSalesCounter = 0;

		const allUniqueSamsForApexOnBoardSales = simplifiedApexOnBoardSalesCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexOnBoardSales) {
			if (typeof item.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Invalid Unique SAM Serial Number: ${item.mac_sam_serial_number}. Expected a number.`);
				continue;
			}
			// Check if the Unique SAM Serial Number already exists in the database.
			const existingUniqueSam = await uniqueSams.findById(item.mac_sam_serial_number);
			// Validate if the Unique SAM Serial Number is not already registered for the same agency and device.
			if (existingUniqueSam) {
				// Validate if this Unique SAM matches the agency and device.
				if (existingUniqueSam.agency_id !== item.agency_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different agency.`);
				if (existingUniqueSam.device_id !== item.device_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different device.`);
				// If it matches, skip to the next item.
				continue;
			}
			// Create a new Unique SAM document.
			await uniqueSams.insertOne({
				_id: item.mac_sam_serial_number,
				agency_id: item.agency_id,
				device_id: item.device_id,
				latest_apex_version: null,
				seen_first_at: null,
				seen_last_at: null,
				status: 'pending',
				status_message: null,
				transactions_expected: null,
				transactions_found: null,
				transactions_missing: null,
			});
			// Increment the counter
			uniqueSamsForOnBoardSalesCounter++;
		}

		LOGGER.info(`Added ${uniqueSamsForOnBoardSalesCounter} Unique SAMs from Simplified Apex OnBoardSales. (${uniqueSamsForOnBoardSalesTimer.get()})`);

		//

		const uniqueSamsForValidationsTimer = new TIMETRACKER();

		let uniqueSamsForValidationsCounter = 0;

		const allUniqueSamsForApexValidations = simplifiedApexValidationsCollection
			.aggregate(agregationPipeline)
			.stream();

		for await (const item of allUniqueSamsForApexValidations) {
			if (typeof item.mac_sam_serial_number !== 'number') {
				LOGGER.error(`Invalid Unique SAM Serial Number: ${item.mac_sam_serial_number}. Expected a number.`);
				continue;
			}
			// Check if the Unique SAM Serial Number already exists in the database.
			const existingUniqueSam = await uniqueSams.findById(item.mac_sam_serial_number);
			// Validate if the Unique SAM Serial Number is not already registered for the same agency and device.
			if (existingUniqueSam) {
				// Validate if this Unique SAM matches the agency and device.
				if (existingUniqueSam.agency_id !== item.agency_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different agency.`);
				if (existingUniqueSam.device_id !== item.device_id) LOGGER.error(`Unique SAM Serial Number ${item.mac_sam_serial_number} already exists for a different device.`);
				// If it matches, skip to the next item.
				continue;
			}
			// Create a new Unique SAM document.
			await uniqueSams.insertOne({
				_id: item.mac_sam_serial_number,
				agency_id: item.agency_id,
				device_id: item.device_id,
				latest_apex_version: null,
				seen_first_at: null,
				seen_last_at: null,
				status: 'pending',
				status_message: null,
				transactions_expected: null,
				transactions_found: null,
				transactions_missing: null,
			});
			// Increment the counter
			uniqueSamsForValidationsCounter++;
		}

		LOGGER.info(`Added ${uniqueSamsForValidationsCounter} Unique SAMs from Simplified Apex Validations. (${uniqueSamsForValidationsTimer.get()})`);

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

	//
};

/* * */

(async function init() {
	const runOnInterval = async () => {
		await createUniqueSamsFromSimplifiedApexTransactions();
		setTimeout(runOnInterval, RUN_INTERVAL);
	};
	runOnInterval();
})();
