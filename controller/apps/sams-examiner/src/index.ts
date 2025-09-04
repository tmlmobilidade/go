/* * */

import { type AggregationResultItem } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { sams, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { type CreateSamDto, SamAnalysis } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		//
		// Connect to databases

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// Ask the coordinator for a batch of SAM IDs to process

		const fetchCoordinatorTimer = new TIMETRACKER();

		const samIdsBatchResponse = await fetch(process.env.COORDINATOR_URL + '/sams');
		const samIdsBatch = await samIdsBatchResponse.json() as number[];

		const fetchCoordinatorTimerResult = fetchCoordinatorTimer.get();

		//
		// With the list of SAM IDs,
		// fetch the actual SAM documents to be processsed

		const fetchSamDocumentsTimer = new TIMETRACKER();

		const samsBatch = await sams.findMany({ _id: { $in: samIdsBatch || [] } });

		LOGGER.info(`Processing ${samsBatch.length} SAMs... (coordinator: ${fetchCoordinatorTimerResult} | interface: ${fetchSamDocumentsTimer.get()})`, 1);

		//
		// For each SAM, we should get all APEX transactions and validate their ASE Counter Value sequence.
		// This will allow us to identify any missing transactions or gaps in the sequence.

		const searchTimestampEnd = Dates
			.now('Europe/Lisbon')
			// .minus({ days: 15 })
			// .startOf('day')
			.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 2, second: 0, year: 2025 })
			.unix_timestamp;

		for (const [samIndex, samItem] of samsBatch.entries()) {
			try {
			//

				LOGGER.divider(`[${samsBatch.length - samIndex}/${samsBatch.length}] [${samItem.agency_id}] SAM ${samItem._id}`);

				//
				// Get all APEX transactions for the current SAM in parallel.
				// Use an aggregation pipeline to avoid fetching unnecessary fields.

				const aggregationPipeline = [
					{ $match: { created_at: { $lt: searchTimestampEnd }, mac_sam_serial_number: samItem._id } },
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

				LOGGER.info(`Location: ${locationTransactionsData.length} | OnBoard Refunds: ${onBoardRefundsTransactionsData.length} | OnBoard Sales: ${onBoardSalesTransactionsData.length} | Validations: ${validationsTransactionsData.length}`);

				//
				// Now merge all transactions into a single variable
				// and sort them by ASE Counter Value.

				const allSimplifiedTransactions: AggregationResultItem[] = [
					...locationTransactionsData as AggregationResultItem[],
					...onBoardRefundsTransactionsData as AggregationResultItem[],
					...onBoardSalesTransactionsData as AggregationResultItem[],
					...validationsTransactionsData as AggregationResultItem[],
				];

				const sortedTransactions = allSimplifiedTransactions
					.filter(t => !!t) // Remove any null or undefined transactions
					.sort((a, b) => a.mac_ase_counter_value - b.mac_ase_counter_value);

				//
				// Validate if all the transactions match the
				// same Agency ID and the same Device ID.

				if (sortedTransactions.length === 0) {
					LOGGER.error(`No transactions found for SAM "${samItem._id}". Skipping.`);
					await sams.updateById(samItem._id, { remarks: 'No transactions found for given time range.', system_status: 'complete' });
					LOGGER.spacer(1);
					continue;
				}

				const agencyId = sortedTransactions[0].agency_id;

				const allTransactionsMatch = sortedTransactions.every(transaction => transaction.agency_id === agencyId);

				if (!allTransactionsMatch) {
					LOGGER.error(`SAM ${samItem._id} has transactions with different Agency ID.`);
					await sams.updateById(samItem._id, { remarks: 'Transactions with different Agency IDs found.', system_status: 'error' });
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
							start_time: previousTx.created_at,
							transactions_expected: currentTx.mac_ase_counter_value - previousTx.mac_ase_counter_value - 1,
							transactions_found: 0,
							transactions_missing: currentTx.mac_ase_counter_value - previousTx.mac_ase_counter_value - 1,
							vehicle_id: null,
						});
						// ...and initiate a new current group
						// with the current transaction
						currentGroup = {
							apex_version: currentTx.apex_version,
							device_id: currentTx.device_id,
							end_time: currentTx.created_at,
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
					_id: samItem._id,
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

				await sams.updateById(samItem._id, updatedSamData);

				LOGGER.success(`Expected: ${updatedSamData.transactions_expected} | Found: ${updatedSamData.transactions_found} | Missing: ${updatedSamData.transactions_missing}`, 1);

			//
			}
			catch (error) {
				LOGGER.error(`Error processing SAM "${samItem._id}": ${error.message}`);
				await sams.updateById(samItem._id, { remarks: `Error processing SAM "${samItem._id}": ${error.message}`, system_status: 'error' });
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
		setTimeout(runOnInterval, 10_000); // 10 seconds
	};
	runOnInterval();
})();
