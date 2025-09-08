/* * */

import { type AggregationResultItem } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { sams, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { type CreateSamDto, Sam, type SamAnalysis } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases

		const samsCollection = await sams.getCollection();

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// Mark all SAMs as "processing" to indicate that they are being analyzed.

		const setAsProcessingTimer = new TIMETRACKER();

		await sams.updateMany(
			{ /* ALL DOCUMENTS */ },
			{ system_status: 'processing' },
			{ returnResults: false },
		);

		LOGGER.success(`Marked all SAMs as "processing" (${setAsProcessingTimer.get()})`);

		//
		// Stream the full collection of SAMs
		// and process them sequentially.

		const samsStream = samsCollection
			.find({ agency_id: { $in: ['41', '42', '43'] } })
			.stream();

		//
		// For each SAM, we should get all APEX transactions and validate their ASE Counter Value sequence.
		// This will allow us to identify any missing transactions or gaps in the sequence.

		let counter = 0;

		for await (const samItem of samsStream) {
			//

			counter++;

			const samData: Sam = samItem;

			try {
				//

				LOGGER.divider(`[${counter}] [${samData.agency_id}] SAM ${samData._id}`);

				//
				// Get all APEX transactions for the current SAM in parallel.
				// Use an aggregation pipeline to avoid fetching unnecessary fields.

				const aggregationTimer = new TIMETRACKER();

				let searchTimestampStart = Dates
					.now('Europe/Lisbon')
					.startOf('day')
					.set({ day: 1, hour: 4, month: 1, year: 2025 })
					.unix_timestamp;

				if (samData.agency_id === '41' || samData.agency_id === '42' || samData.agency_id === '43') {
					searchTimestampStart = Dates
						.now('Europe/Lisbon')
						.startOf('day')
						.set({ day: 22, hour: 4, month: 8, year: 2025 })
						.unix_timestamp;
				}

				const searchTimestampEnd = Dates
					.now('Europe/Lisbon')
					.startOf('day')
					.minus({ days: 5 })
					.unix_timestamp;

				const aggregationPipeline = [
					{ $match: { created_at: { $gte: searchTimestampStart, $lte: searchTimestampEnd }, mac_sam_serial_number: samData._id } },
					{ $project: { _id: 1, agency_id: 1, apex_version: 1, created_at: 1, device_id: 1, mac_ase_counter_value: 1, vehicle_id: 1 } },
				];

				const locationTransactionsPromise = simplifiedApexLocationsCollection.aggregate(aggregationPipeline).toArray();
				const onBoardRefundsTransactionsPromise = simplifiedApexOnBoardRefundsCollection.aggregate(aggregationPipeline).toArray();
				const onBoardSalesTransactionsPromise = simplifiedApexOnBoardSalesCollection.aggregate(aggregationPipeline).toArray();
				const validationsTransactionsPromise = simplifiedApexValidationsCollection.aggregate(aggregationPipeline).toArray();

				const [
					locationTransactionsData,
					onBoardRefundsTransactionsData,
					onBoardSalesTransactionsData,
					validationsTransactionsData,
				] = await Promise.all([
					locationTransactionsPromise,
					onBoardRefundsTransactionsPromise,
					onBoardSalesTransactionsPromise,
					validationsTransactionsPromise,
				]);

				LOGGER.info(`Location: ${locationTransactionsData.length} | OnBoard Refunds: ${onBoardRefundsTransactionsData.length} | OnBoard Sales: ${onBoardSalesTransactionsData.length} | Validations: ${validationsTransactionsData.length} (${aggregationTimer.get()})`);

				//
				// Now merge all transactions into a single variable
				// and sort them by ASE Counter Value.

				const analysisTimer = new TIMETRACKER();

				const preparedLocationTransactions = locationTransactionsData.map(item => ({ ...item, transaction_type: 'location' })) as AggregationResultItem[];
				const preparedOnBoardRefundsTransactions = onBoardRefundsTransactionsData.map(item => ({ ...item, transaction_type: 'on_board_refund' })) as AggregationResultItem[];
				const preparedOnBoardSalesTransactions = onBoardSalesTransactionsData.map(item => ({ ...item, transaction_type: 'on_board_sale' })) as AggregationResultItem[];
				const preparedValidationsTransactions = validationsTransactionsData.map(item => ({ ...item, transaction_type: 'validation' })) as AggregationResultItem[];

				const allSimplifiedTransactions: AggregationResultItem[] = [
					...preparedLocationTransactions,
					...preparedOnBoardRefundsTransactions,
					...preparedOnBoardSalesTransactions,
					...preparedValidationsTransactions,
				];

				const sortedTransactions = allSimplifiedTransactions
					.filter(t => !!t) // Remove any null or undefined transactions
					.sort((a, b) => a.mac_ase_counter_value - b.mac_ase_counter_value);

				//
				// Validate if all the transactions match the
				// same Agency ID and the same Device ID.

				if (sortedTransactions.length === 0) {
					LOGGER.error(`No transactions found for SAM "${samData._id}" for the given time range. (${analysisTimer.get()})`);
					await sams.updateById(samData._id, { analysis: [], remarks: 'No transactions found for given time range.', system_status: 'complete' });
					LOGGER.spacer(1);
					continue;
				}

				const agencyId = sortedTransactions[0].agency_id;

				const allTransactionsMatch = sortedTransactions.every(transaction => transaction.agency_id === agencyId);

				if (!allTransactionsMatch) {
					LOGGER.error(`SAM ${samData._id} has transactions with different Agency ID. (${analysisTimer.get()})`);
					await sams.updateById(samData._id, { analysis: [], remarks: 'Transactions with different Agency IDs found.', system_status: 'error' });
					LOGGER.spacer(1);
					continue;
				}

				//
				// Validate if there are transactions with invalid
				// mac_ase_counter_value values, such as = 0 or null.

				const allMacAseCounterValuesValid = sortedTransactions.every(transaction => transaction.mac_ase_counter_value > 0 && transaction.mac_ase_counter_value !== null && transaction.mac_ase_counter_value !== undefined);

				if (!allMacAseCounterValuesValid) {
					LOGGER.error(`SAM ${samData._id} has transactions with invalid mac_ase_counter_value. (${analysisTimer.get()})`);
					await sams.updateById(samData._id, { analysis: [], remarks: 'Transactions with invalid mac_ase_counter_value found.', system_status: 'error' });
					LOGGER.spacer(1);
					continue;
				}

				//
				// Create groups of continuous sequentiality
				// for the same device and vehicle.

				const samAnalysisGroups: SamAnalysis[] = [];

				let currentGroup: SamAnalysis = {
					apex_version: sortedTransactions[0].apex_version,
					device_id: sortedTransactions[0].device_id,
					end_time: sortedTransactions[0].created_at,
					first_transaction_ase_counter_value: sortedTransactions[0].mac_ase_counter_value,
					first_transaction_id: sortedTransactions[0]._id,
					first_transaction_type: sortedTransactions[0].transaction_type,
					last_transaction_ase_counter_value: sortedTransactions[0].mac_ase_counter_value,
					last_transaction_id: sortedTransactions[0]._id,
					last_transaction_type: sortedTransactions[0].transaction_type,
					start_time: sortedTransactions[0].created_at,
					transactions_expected: 1,
					transactions_found: 1,
					transactions_missing: 0,
					vehicle_id: sortedTransactions[0].vehicle_id,
				};

				for (let i = 1; i < sortedTransactions.length; i++) {
					// Setup variables
					const previousTx = sortedTransactions[i - 1];
					const currentTx = sortedTransactions[i];
					// Compare transaction properties
					const hasSameDeviceId = currentTx.device_id === previousTx.device_id;
					const hasSameVehicleId = currentTx.vehicle_id === previousTx.vehicle_id;
					const hasSameApexVersion = currentTx.apex_version === previousTx.apex_version;
					const aseCounterIsSequential = currentTx.mac_ase_counter_value === previousTx.mac_ase_counter_value + 1;
					// If all checks pass, we can consider them part of the same group
					if (hasSameDeviceId && hasSameVehicleId && hasSameApexVersion && aseCounterIsSequential) {
						// Update the current group with
						// the latest transaction details
						currentGroup.end_time = currentTx.created_at;
						currentGroup.last_transaction_id = currentTx._id;
						currentGroup.last_transaction_type = currentTx.transaction_type;
						currentGroup.transactions_expected++;
						currentGroup.transactions_found++;
					}
					else {
						// If any of the checks fail, we need
						// to save the current group...
						samAnalysisGroups.push(currentGroup);
						// ...create a new one with the gap...
						samAnalysisGroups.push({
							apex_version: null,
							device_id: null,
							end_time: currentTx.created_at,
							first_transaction_ase_counter_value: null,
							first_transaction_id: null,
							first_transaction_type: null,
							last_transaction_ase_counter_value: null,
							last_transaction_id: null,
							last_transaction_type: null,
							start_time: previousTx.created_at,
							transactions_expected: (currentTx.mac_ase_counter_value - previousTx.mac_ase_counter_value) - 1,
							transactions_found: 0,
							transactions_missing: (currentTx.mac_ase_counter_value - previousTx.mac_ase_counter_value) - 1,
							vehicle_id: null,
						});
						// ...and initiate a new current group
						// with the current transaction
						currentGroup = {
							apex_version: currentTx.apex_version,
							device_id: currentTx.device_id,
							end_time: currentTx.created_at,
							first_transaction_ase_counter_value: currentTx.mac_ase_counter_value,
							first_transaction_id: currentTx._id,
							first_transaction_type: currentTx.transaction_type,
							last_transaction_ase_counter_value: currentTx.mac_ase_counter_value,
							last_transaction_id: currentTx._id,
							last_transaction_type: currentTx.transaction_type,
							start_time: currentTx.created_at,
							transactions_expected: 1,
							transactions_found: 1,
							transactions_missing: 0,
							vehicle_id: currentTx.vehicle_id,
						};
					}
				}

				//
				// Save the final group

				samAnalysisGroups.push(currentGroup);

				//
				// Update the SAM with the latest ASE Counter Value
				// and the number of transactions.

				const firstTransaction = sortedTransactions[0];
				const latestTransaction = sortedTransactions[sortedTransactions.length - 1];

				const transactionsFound = sortedTransactions.length;
				const transactionsExpected = latestTransaction.mac_ase_counter_value - firstTransaction.mac_ase_counter_value + 1;
				const transactionsMissing = transactionsExpected - transactionsFound;

				//
				// Update the SAM with the new data.

				const updatedSamData: CreateSamDto = {
					_id: samData._id,
					agency_id: agencyId,
					analysis: samAnalysisGroups,
					latest_apex_version: latestTransaction.apex_version,
					remarks: null,
					seen_first_at: firstTransaction.created_at,
					seen_last_at: latestTransaction.created_at,
					system_status: 'complete',
					transactions_expected: transactionsExpected,
					transactions_found: transactionsFound,
					transactions_missing: transactionsMissing,
				};

				await sams.updateById(samData._id, updatedSamData);

				LOGGER.success(`Expected: ${updatedSamData.transactions_expected} | Found: ${updatedSamData.transactions_found} | Missing: ${updatedSamData.transactions_missing} (${analysisTimer.get()})`, 1);

			//
			}
			catch (error) {
				LOGGER.error(`Error processing SAM "${samData._id}": ${error.message}`);
				await sams.updateById(samData._id, { remarks: `Error processing SAM "${samData._id}": ${error.message}`, system_status: 'error' });
			}
		}

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
		await main();
		setTimeout(runOnInterval, 20000); // 20 seconds
	};
	runOnInterval();
})();
