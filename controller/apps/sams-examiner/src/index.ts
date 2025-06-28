/* * */

import { AggregationResultItem } from '@/types.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, uniqueSams } from '@tmlmobilidade/interfaces';
import { ProcessingStatus, type UpdateUniqueSamDto } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		const allUniqueSamsCollection = await uniqueSams.getCollection();
		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// For each Unique SAM, we should get all APEX transactions and validate their ASE Counter Value sequence.
		// This will allow us to identify any missing transactions or gaps in the sequence.

		const searchTimestampEnd = Dates
			.now('Europe/Lisbon')
			.minus({ days: 15 })
			.startOf('day')
			// .set({ day: 2, hour: 3, millisecond: 59, minute: 59, month: 1, second: 59, year: 2024 })
			.unix_timestamp;

		const allUniqueSams = await allUniqueSamsCollection
			.find({ system_status: ProcessingStatus.Waiting })
			.toArray();

		for (const [uniqueSamIndex, uniqueSamItem] of allUniqueSams.entries()) {
			//

			//
			// Get all APEX transactions for the current Unique SAM in parallel.

			LOGGER.divider(`[${allUniqueSams.length - uniqueSamIndex}/${allUniqueSams.length}] [${uniqueSamItem.agency_id}] Unique SAM ${uniqueSamItem._id}`);

			const aggrgationPipeline = [
				{ $match: { created_at: { $lte: searchTimestampEnd }, mac_sam_serial_number: uniqueSamItem._id } },
				{ $project: { _id: 1, agency_id: 1, apex_version: 1, created_at: 1, device_id: 1, mac_ase_counter_value: 1 } },
			];

			const locationTransactionsPromise = simplifiedApexLocationsCollection.aggregate(aggrgationPipeline).toArray();
			const onBoardRefundsTransactionsPromise = simplifiedApexOnBoardRefundsCollection.aggregate(aggrgationPipeline).toArray();
			const onBoardSalesTransactionsPromise = simplifiedApexOnBoardSalesCollection.aggregate(aggrgationPipeline).toArray();
			const validationsTransactionsPromise = simplifiedApexValidationsCollection.aggregate(aggrgationPipeline).toArray();

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
				LOGGER.error(`No transactions found for Unique SAM "${uniqueSamItem._id}". Skipping.`);
				LOGGER.spacer(1);
				continue;
			}

			const agencyId = sortedTransactions[0].agency_id;

			const allTransactionsMatch = sortedTransactions.every(transaction => transaction.agency_id === agencyId);

			if (!allTransactionsMatch) {
				LOGGER.error(`Unique SAM ${uniqueSamItem._id} has transactions with different Agency ID.`);
			}

			//
			// Update the Unique SAM with the latest ASE Counter Value
			// and the number of transactions.

			const firstTransaction = sortedTransactions[0];
			const latestTransaction = sortedTransactions[sortedTransactions.length - 1];

			const transactionsFound = sortedTransactions.length;
			const transactionsExpected = latestTransaction.mac_ase_counter_value - firstTransaction.mac_ase_counter_value + 1;
			const transactionsMissing = transactionsExpected - transactionsFound;

			const foundDeviceIds = new Set(sortedTransactions.map(t => t.device_id));

			//
			// Get the aseCounterValues missing

			const aseCounterValues = sortedTransactions.map(t => t.mac_ase_counter_value);
			const aseCounterValuesSet = new Set(aseCounterValues);
			const missingAseCounterValues = [];

			for (let i = firstTransaction.mac_ase_counter_value; i <= latestTransaction.mac_ase_counter_value; i++) {
				if (!aseCounterValuesSet.has(i)) {
					missingAseCounterValues.push(i);
				}
			}

			//
			// Update the Unique SAM with the new data.

			const updatedSamData: UpdateUniqueSamDto = {
				agency_id: agencyId,
				device_ids: Array.from(foundDeviceIds),
				is_complete: transactionsMissing === 0 ? true : false,
				latest_apex_version: latestTransaction.apex_version,
				remarks: transactionsMissing === 0 ? 'All transactions found.' : `Missing ${transactionsMissing} transactions. [${missingAseCounterValues.join(',')}]`,
				seen_first_at: firstTransaction.created_at,
				seen_last_at: latestTransaction.created_at,
				system_status: ProcessingStatus.Complete,
				transactions_expected: transactionsExpected,
				transactions_found: transactionsFound,
				transactions_missing: transactionsMissing,
			};

			await uniqueSams.updateById(uniqueSamItem._id, updatedSamData);

			LOGGER.success(`Complete: ${updatedSamData.is_complete} | Expected: ${updatedSamData.transactions_expected} | Found: ${updatedSamData.transactions_found} | Missing: ${updatedSamData.transactions_missing}`, 1);

			//
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
		setTimeout(runOnInterval, 60_000); // 1 minute
	};
	runOnInterval();
})();
