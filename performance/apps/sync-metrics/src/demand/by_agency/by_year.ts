/* * */

import { logMetricToFile } from '@/logMetrics.js';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates, Logs } from '@tmlmobilidade/utils';

/* * */

export const syncDemandByAgencyByYear = async () => {
	//

	Logs.title(`Sync Demand Metrics by Agency by Year`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_agency_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logs.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logs.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Define yearly chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.plus({ days: 1 });

	const allTimestampChunks: { end: number, start: number }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ years: 1 });
		allTimestampChunks.push({
			end: next.unix_timestamp,
			start: cursor.unix_timestamp,
		});
		cursor = next;
	}

	//
	// Process each year in parallel

	const agencyMap = new Map<string, Metric>();

	const yearPromises = allTimestampChunks.map(async (chunkData) => {
		const chunkTimer = new TIMETRACKER();

		const year = new Date(chunkData.start).getFullYear();

		Logs.info(`Processing Year ${year}...`);

		//
		// Aggregate by agency_id for this year

		const validationsAgg = await validationsCollection.aggregate([
			{
				$match: {
					created_at: {
						$gte: chunkData.start,
						$lt: chunkData.end,
					},
					is_passenger: true,
				},
			},
			{
				$group: {
					_id: '$agency_id',
					agency_id: { $first: '$agency_id' },
					count: { $sum: 1 },
				},
			},
		], { hint: 'is_passenger_1_agency_id_1_created_at_1' }).toArray();

		Logs.info(`Year ${year} aggregation returned ${validationsAgg.length} agency groups (${chunkTimer.get()})`);
		return { validationsAgg, year };
	});

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(yearPromises);

	for (const { validationsAgg, year } of allChunksResults) {
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
			agencyDoc.data[year] = { qty: validation.count };
		}
	}

	const results = Array.from(agencyMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by year, aggregate on mongo (parallel)', key: 'loop_year_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logs.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
