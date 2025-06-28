/* * */

import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations, uniqueSams } from '@tmlmobilidade/interfaces';
import { ProcessingStatus, UnixTimestamp, UpdateUniqueSamDto } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

async function main() {
	try {
		//

		LOGGER.init();

		const globalTimer = new TIMETRACKER();

		const allUniqueSamsCollection = await uniqueSams.getCollection();

		//
		// For each Unique SAM, we should get all APEX transactions and validate their ASE Counter Value sequence.
		// This will allow us to identify any missing transactions or gaps in the sequence.

		const searchTimestampStart = Dates
			.now('Europe/Lisbon')
			.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 })
			.unix_timestamp;

		const searchTimestampEnd = Dates
			.now('Europe/Lisbon')
			.minus({ days: 15 })
			.startOf('day')
			// .set({ day: 2, hour: 3, millisecond: 59, minute: 59, month: 7, second: 59, year: 2024 })
			// .set({ day: 2, hour: 3, millisecond: 59, minute: 59, month: 1, second: 59, year: 2024 })
			.unix_timestamp;

		const allUniqueSamsStream = allUniqueSamsCollection
			.find()
			.stream();

		for await (const uniqueSam of allUniqueSamsStream) {
			//

			//
			// Get all APEX transactions for the current Unique SAM in parallel.

			LOGGER.info(`Examining Unique SAM: ${uniqueSam._id}`);

			const locationTransactionsPromise = simplifiedApexLocations.findMany({ created_at: { $gte: searchTimestampStart, $lte: searchTimestampEnd }, mac_sam_serial_number: uniqueSam._id });
			const onBoardRefundsTransactionsPromise = simplifiedApexOnBoardRefunds.findMany({ created_at: { $gte: searchTimestampStart, $lte: searchTimestampEnd }, mac_sam_serial_number: uniqueSam._id });
			const onBoardSalesTransactionsPromise = simplifiedApexOnBoardSales.findMany({ created_at: { $gte: searchTimestampStart, $lte: searchTimestampEnd }, mac_sam_serial_number: uniqueSam._id });
			const validationsTransactionsPromise = simplifiedApexValidations.findMany({ created_at: { $gte: searchTimestampStart, $lte: searchTimestampEnd }, mac_sam_serial_number: uniqueSam._id });

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
			// Simplify all transaction to only keep the necessary fields for validation.

			const simplifiedLocationTransactions = locationTransactionsData.map(transaction => ({
				_id: transaction._id,
				agency_id: transaction.agency_id,
				apex_version: transaction.apex_version,
				created_at: transaction.created_at,
				device_id: transaction.device_id,
				mac_ase_counter_value: transaction.mac_ase_counter_value,
			}));

			const simplifiedOnBoardRefundTransactions = onBoardRefundsTransactionsData.map(transaction => ({
				_id: transaction._id,
				agency_id: transaction.agency_id,
				apex_version: transaction.apex_version,
				created_at: transaction.created_at,
				device_id: transaction.device_id,
				mac_ase_counter_value: transaction.mac_ase_counter_value,
			}));

			const simplifiedOnBoardSaleTransactions = onBoardSalesTransactionsData.map(transaction => ({
				_id: transaction._id,
				agency_id: transaction.agency_id,
				apex_version: transaction.apex_version,
				created_at: transaction.created_at,
				device_id: transaction.device_id,
				mac_ase_counter_value: transaction.mac_ase_counter_value,
			}));

			const simplifiedValidationTransactions = validationsTransactionsData.map(transaction => ({
				_id: transaction._id,
				agency_id: transaction.agency_id,
				apex_version: transaction.apex_version,
				created_at: transaction.created_at,
				device_id: transaction.device_id,
				mac_ase_counter_value: transaction.mac_ase_counter_value,
			}));

			//
			// Now merge all transactions into a single variable
			// and sort them by ASE Counter Value.

			const allSimplifiedTransactions = [
				...simplifiedLocationTransactions,
				...simplifiedOnBoardRefundTransactions,
				...simplifiedOnBoardSaleTransactions,
				...simplifiedValidationTransactions,
			];

			const sortedTransactions = allSimplifiedTransactions
				.filter(t => !!t) // Remove any null or undefined transactions
				.sort((a, b) => a.mac_ase_counter_value - b.mac_ase_counter_value);

			//
			// Validate if all the transactions match the
			// same Agency ID and the same Device ID.

			if (sortedTransactions.length === 0) {
				LOGGER.error(`No transactions found for Unique SAM "${uniqueSam._id}". Skipping.`);
				LOGGER.spacer(1);
				continue;
			}

			const agencyId = sortedTransactions[0].agency_id;

			const allTransactionsMatch = sortedTransactions.every(transaction => transaction.agency_id === agencyId);

			if (!allTransactionsMatch) {
				LOGGER.error(`Unique SAM ${uniqueSam._id} has transactions with different Agency ID.`);
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
				seen_first_at: firstTransaction.created_at as UnixTimestamp,
				seen_last_at: latestTransaction.created_at as UnixTimestamp,
				system_status: ProcessingStatus.Complete,
				transactions_expected: transactionsExpected,
				transactions_found: transactionsFound,
				transactions_missing: transactionsMissing,
			};

			await uniqueSams.updateById(uniqueSam._id, updatedSamData);

			LOGGER.success(`SAM ${uniqueSam._id} [${updatedSamData.agency_id}] Is Complete: ${updatedSamData.is_complete} | Expected: ${updatedSamData.transactions_expected} | Found: ${updatedSamData.transactions_found} | Missing: ${updatedSamData.transactions_missing}`, 1);

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
