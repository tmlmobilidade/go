/* * */

import { logMetricToFile } from '@/logMetrics.js';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@go/interfaces';
import { Metric } from '@go/types';
import { Dates, Logs } from '@go/utils';

/* * */

export const syncDemandByAgencyByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Agency by Month`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch validations collection
	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Define monthly chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: 1 });

	const allTimestampChunks: { end: number, endIso: string, start: number, startIso: string }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ months: 1 });
		allTimestampChunks.push({
			end: next.unix_timestamp,
			endIso: next.iso,
			start: cursor.unix_timestamp,
			startIso: cursor.iso,
		});
		cursor = next;
	}

	//
	// Process each month in parallel

	const agencyMap = new Map<string, Metric>();

	const monthPromises = allTimestampChunks.map(async (chunkData, chunkIndex) => {
		const chunkTimer = new TIMETRACKER();

		const yearMonth = new Date(chunkData.start).toISOString().slice(0, 7);

		//
		// Aggregation per month (group by agency_id)

		const validationsAgg = await validationsCollection.aggregate([
			{
				$match: {
					created_at: { $gte: chunkData.start, $lt: chunkData.end },
					is_passenger: true,
				},
			},
			{
				$group: {
					_id: '$agency_id',
					agency_id: { $first: '$agency_id' },
					count: { $sum: 1 },
					month_year: { $first: yearMonth },
				},
			},
		], { hint: 'is_passenger_1_agency_id_1_created_at_1' }).toArray();

		Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} agencies (${chunkTimer.get()})`);
		return validationsAgg;
	});

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(monthPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const agency_id = validation.agency_id ?? 'no-agency';
			if (!agencyMap.has(agency_id)) {
				agencyMap.set(agency_id, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passenger demand for agency ${agency_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { agency_id },
				} as Metric);
			}
			const agencyDoc = agencyMap.get(agency_id);
			agencyDoc.data[validation.month_year] = { qty: validation.count };
		}
	}

	const results = Array.from(agencyMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by month, aggregate on mongo (parallel)', key: 'loop_month_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
