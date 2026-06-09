/* * */

import { type AggregationResultItem } from '@/types.js';
import { Dates } from '@tmlmobilidade/dates';
import { sams, simplifiedApexLocations, simplifiedApexOnBoardRefunds, simplifiedApexOnBoardSales, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { initSentryNode } from '@tmlmobilidade/logger/sentry/node';
import { Timer } from '@tmlmobilidade/timer';
import { type CreateSamDto, Sam, type SamAnalysis, type SamTimelineSummary, UpdateSamDto } from '@tmlmobilidade/types';
import { runOnInterval } from '@tmlmobilidade/utils';

/* * */

const LISBON_TZ = 'Europe/Lisbon';
const YEAR_MONTH_FORMATTER = new Intl.DateTimeFormat('en-CA', {
	month: '2-digit',
	timeZone: LISBON_TZ,
	year: 'numeric',
});

function getMonthKeyFromTimestamp(unixTimestamp: number): null | string {
	if (!Number.isFinite(unixTimestamp)) return null;
	const parts = YEAR_MONTH_FORMATTER.formatToParts(new Date(unixTimestamp));
	const year = parts.find(part => part.type === 'year')?.value;
	const month = parts.find(part => part.type === 'month')?.value;
	if (!year || !month) return null;
	return `${year}-${month}`;
}

function getAnalysisMonthKeys(analysis: SamAnalysis): string[] {
	if (analysis.start_time == null && analysis.end_time == null) return [];

	const startTs = analysis.start_time ?? analysis.end_time;
	const endTs = analysis.end_time ?? analysis.start_time;

	if (startTs == null || endTs == null) return [];

	const from = Math.min(startTs, endTs);
	const to = Math.max(startTs, endTs);

	const monthKeys = new Set<string>();
	let cursor = Dates.fromUnixTimestamp(from).setZone(LISBON_TZ, 'offset_only').startOf('month');
	const last = Dates.fromUnixTimestamp(to).setZone(LISBON_TZ, 'offset_only').startOf('month');

	while (cursor.unix_timestamp <= last.unix_timestamp) {
		const monthKey = getMonthKeyFromTimestamp(cursor.unix_timestamp);
		if (monthKey) monthKeys.add(monthKey);
		cursor = cursor.plus({ months: 1 });
	}

	return [...monthKeys];
}

function buildTimelineSummary(analyses: SamAnalysis[]): SamTimelineSummary {
	interface Counters { invalid: number, valid: number }

	const monthCounters = new Map<string, Counters>();
	let undatedValid = 0;
	let undatedInvalid = 0;

	for (const analysis of analyses) {
		const isValid = analysis.first_transaction_id != null && analysis.last_transaction_id != null;
		const monthKeys = getAnalysisMonthKeys(analysis);

		if (monthKeys.length === 0) {
			if (isValid) undatedValid++;
			else undatedInvalid++;
			continue;
		}

		for (const monthKey of monthKeys) {
			const counters = monthCounters.get(monthKey) ?? { invalid: 0, valid: 0 };
			if (isValid) counters.valid++;
			else counters.invalid++;
			monthCounters.set(monthKey, counters);
		}
	}

	const months = [...monthCounters.entries()]
		.sort(([a], [b]) => a.localeCompare(b))
		.map(([key, counters]) => ({
			failed_count: counters.invalid,
			month: key,
			successful_count: counters.valid,
		}));

	const undatedCount = undatedValid + undatedInvalid;
	const undated = undatedCount > 0
		? {
			failed_count: undatedInvalid,
			successful_count: undatedValid,
		}
		: undefined;

	return { months, undated };
}

/* * */

async function main() {
	try {
		//

		//
		// Initialize Sentry

		try {
			await initSentryNode();
			Logger.info('');
			Logger.logsNode({ app: 'sams-examiner', message: 'Sentry Sams Examiner initialized', module: 'controller', severity: 'info' });
		} catch (error) {
			Logger.error('Error initializing Sentry Sams Examiner', error);
		}

		//
		// Initialize the logger

		Logger.init();

		const globalTimer = new Timer();

		//
		// Connect to databases

		const samsCollection = await sams.getCollection();

		const simplifiedApexLocationsCollection = await simplifiedApexLocations.getCollection();
		const simplifiedApexOnBoardRefundsCollection = await simplifiedApexOnBoardRefunds.getCollection();
		const simplifiedApexOnBoardSalesCollection = await simplifiedApexOnBoardSales.getCollection();
		const simplifiedApexValidationsCollection = await simplifiedApexValidations.getCollection();

		//
		// Mark all SAMs as "processing" to indicate that they are being analyzed.

		const setAsProcessingTimer = new Timer();

		await sams.updateMany(
			{ /* ALL DOCUMENTS */ },
			{ system_status: 'incomplete' },
			{ returnResults: false },
		);

		Logger.success(`Marked all SAMs as "processing" (${setAsProcessingTimer.get()})`);

		//
		// Stream the full collection of SAMs
		// and process them sequentially.

		const samsStream = samsCollection
			.find()
			.stream();

		//
		// For each SAM, we should get all APEX transactions and validate their ASE Counter Value sequence.
		// This will allow us to identify any missing transactions or gaps in the sequence.

		let counter = await sams.count();

		for await (const samItem of samsStream) {
			//

			const samData: Sam = samItem;

			try {
				//

				//
				// Get all APEX transactions for the current SAM in parallel.
				// Use an aggregation pipeline to avoid fetching unnecessary fields.

				const aggregationTimer = new Timer();

				let searchTimestampStart = Dates
					.now('Europe/Lisbon')
					.startOf('day')
					.set({ day: 1, hour: 4, minute: 0, month: 1, year: 2025 });

				if (samData.agency_id === '43') {
					searchTimestampStart = Dates
						.now('Europe/Lisbon')
						.startOf('day')
						.set({ day: 1, hour: 4, minute: 0, month: 10, year: 2025 });
				}

				if (samData.agency_id === '41' || samData.agency_id === '42') {
					searchTimestampStart = Dates
						.now('Europe/Lisbon')
						.startOf('day')
						.set({ day: 8, hour: 4, minute: 0, month: 12, year: 2025 });
				}

				const searchTimestampEnd = Dates
					.now('Europe/Lisbon')
					.minus({ days: 1 })
					.set({ hour: 4, millisecond: 0, minute: 0, second: 0 });

				Logger.divider(`#${counter} [${samData.agency_id}] SAM ${samData._id} | ${searchTimestampStart.iso}[${searchTimestampStart.unix_timestamp}] › ${searchTimestampEnd.iso}[${searchTimestampEnd.unix_timestamp}]`);

				//
				// Prepare the aggregation pipeline for APEX transactions.

				const aggregationPipeline = [
					{ $match: { created_at: { $gte: searchTimestampStart.unix_timestamp, $lte: searchTimestampEnd.unix_timestamp }, mac_sam_serial_number: samData._id } },
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

				Logger.info(`Location: ${locationTransactionsData.length} | OnBoard Refunds: ${onBoardRefundsTransactionsData.length} | OnBoard Sales: ${onBoardSalesTransactionsData.length} | Validations: ${validationsTransactionsData.length} (${aggregationTimer.get()})`);

				//
				// Now merge all transactions into a single variable
				// and sort them by ASE Counter Value.

				const analysisTimer = new Timer();

				const preparedLocationTransactions: AggregationResultItem[] = locationTransactionsData.map(item => ({ _id: item._id, agency_id: item.agency_id, apex_version: item.apex_version, created_at: item.created_at, device_id: item.device_id, mac_ase_counter_value: item.mac_ase_counter_value, transaction_type: 'location', vehicle_id: item.vehicle_id }));
				const preparedOnBoardRefundsTransactions: AggregationResultItem[] = onBoardRefundsTransactionsData.map(item => ({ _id: item._id, agency_id: item.agency_id, apex_version: item.apex_version, created_at: item.created_at, device_id: item.device_id, mac_ase_counter_value: item.mac_ase_counter_value, transaction_type: 'on_board_refund', vehicle_id: item.vehicle_id }));
				const preparedOnBoardSalesTransactions: AggregationResultItem[] = onBoardSalesTransactionsData.map(item => ({ _id: item._id, agency_id: item.agency_id, apex_version: item.apex_version, created_at: item.created_at, device_id: item.device_id, mac_ase_counter_value: item.mac_ase_counter_value, transaction_type: 'on_board_sale', vehicle_id: item.vehicle_id }));
				const preparedValidationTransactions: AggregationResultItem[] = validationsTransactionsData.map(item => ({ _id: item._id, agency_id: item.agency_id, apex_version: item.apex_version, created_at: item.created_at, device_id: item.device_id, mac_ase_counter_value: item.mac_ase_counter_value, transaction_type: 'validation', vehicle_id: item.vehicle_id }));

				const allSimplifiedTransactions: AggregationResultItem[] = [
					...preparedLocationTransactions,
					...preparedOnBoardRefundsTransactions,
					...preparedOnBoardSalesTransactions,
					...preparedValidationTransactions,
				];

				const sortedTransactions = allSimplifiedTransactions
					.filter(t => !!t) // Remove any null or undefined transactions
					.sort((a, b) => a.mac_ase_counter_value - b.mac_ase_counter_value);

				//
				// Validate if there are any transactions
				// for the current SAM in the given time range.

				if (!sortedTransactions.length) {
					Logger.error(`No transactions found for SAM "${samData._id}" for the given time range. (${analysisTimer.get()})`);
					const noTxUpdate = { analysis: [], remarks: 'No transactions found for given time range.', system_status: 'complete', timeline_summary: { months: [] } };
					await sams.updateById(samData._id, noTxUpdate as Partial<CreateSamDto>);
					Logger.spacer(1);
					continue;
				}

				//
				// Validate if all the transactions
				// match the same Agency ID.

				const agencyId = sortedTransactions[0].agency_id;

				const allTransactionsMatch = sortedTransactions.every(transaction => transaction.agency_id === agencyId);

				if (!allTransactionsMatch) {
					Logger.error(`SAM ${samData._id} has transactions with different Agency ID. (${analysisTimer.get()})`);
					const agencyErrorUpdate = { analysis: [], remarks: 'Transactions with different Agency IDs found.', system_status: 'error', timeline_summary: { months: [] } };
					await sams.updateById(samData._id, agencyErrorUpdate as Partial<CreateSamDto>);
					Logger.spacer(1);
					continue;
				}

				//
				// Validate if there are transactions with invalid
				// mac_ase_counter_value values, such as = 0 or null.

				const allMacAseCounterValuesValid = sortedTransactions.every(transaction => transaction.mac_ase_counter_value > 0 && transaction.mac_ase_counter_value !== null && transaction.mac_ase_counter_value !== undefined);

				if (!allMacAseCounterValuesValid) {
					Logger.error(`SAM ${samData._id} has transactions with invalid mac_ase_counter_value. (${analysisTimer.get()})`);
					const counterErrorUpdate = { analysis: [], remarks: 'Transactions with invalid mac_ase_counter_value found.', system_status: 'error', timeline_summary: { months: [] } };
					await sams.updateById(samData._id, counterErrorUpdate as Partial<CreateSamDto>);
					Logger.spacer(1);
					continue;
				}

				//
				// Validate if all transactions have
				// different values for ase_counter_value.

				const foundAseCounterValues: Record<number, number> = {};

				sortedTransactions.forEach((transaction) => {
					// Initialize counter if not present
					if (!foundAseCounterValues[transaction.mac_ase_counter_value]) foundAseCounterValues[transaction.mac_ase_counter_value] = 0;
					// Increment counter for this ASE Counter Value
					foundAseCounterValues[transaction.mac_ase_counter_value]++;
				});

				const duplicateAseCounterValues = Object.values(foundAseCounterValues).filter(count => count > 1);

				if (duplicateAseCounterValues.length > 0) {
					Logger.error(`SAM ${samData._id} has ${duplicateAseCounterValues.length} transactions with duplicate mac_ase_counter_value. (${analysisTimer.get()})`);
					const duplicateCounterUpdate = { analysis: [], remarks: 'Transactions with duplicate mac_ase_counter_value found.', system_status: 'error', timeline_summary: { months: [] } };
					await sams.updateById(samData._id, duplicateCounterUpdate as Partial<CreateSamDto>);
					Logger.spacer(1);
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
						// Update the current group with the latest transaction details
						currentGroup.end_time = currentTx.created_at;
						currentGroup.last_transaction_ase_counter_value = currentTx.mac_ase_counter_value;
						currentGroup.last_transaction_id = currentTx._id;
						currentGroup.last_transaction_type = currentTx.transaction_type;
						currentGroup.transactions_expected++;
						currentGroup.transactions_found++;
					} else {
						// If any of the checks fail, we need
						// to save the current group as it is terminated here.
						samAnalysisGroups.push(currentGroup);
						// Then, check if there is a gap in the ASE Counter Value.
						// There might not be a gap if, for example, the Vehicle ID changed
						// but the ASE Counter Value continued sequentially.
						if (!aseCounterIsSequential) {
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
						}
						// Now initiate a new current group
						// with the current transaction.
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

				const updatedSamData: UpdateSamDto = {
					_id: samData._id,
					agency_id: agencyId,
					analysis: samAnalysisGroups,
					latest_apex_version: latestTransaction.apex_version,
					remarks: null,
					seen_first_at: firstTransaction.created_at,
					seen_last_at: latestTransaction.created_at,
					system_status: 'complete',
					timeline_summary: buildTimelineSummary(samAnalysisGroups),
					transactions_expected: transactionsExpected,
					transactions_found: transactionsFound,
					transactions_missing: transactionsMissing,
				};

				await sams.updateById(samData._id, updatedSamData);

				Logger.success(`Expected: ${updatedSamData.transactions_expected} | Found: ${updatedSamData.transactions_found} | Missing: ${updatedSamData.transactions_missing} (${analysisTimer.get()})`, 1);

			//
			} catch (error) {
				Logger.error(`Error processing SAM "${samData._id}": ${error.message}`);
				const processingErrorUpdate = { remarks: `Error processing SAM "${samData._id}": ${error.message}`, system_status: 'error', timeline_summary: { months: [] } };
				await sams.updateById(samData._id, processingErrorUpdate as Partial<CreateSamDto>);
			} finally {
				counter--;
			}
		}

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

	//
};

/* * */

await runOnInterval(main, { intervalMs: '3h' });
