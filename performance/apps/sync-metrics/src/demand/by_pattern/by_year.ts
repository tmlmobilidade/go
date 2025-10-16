/* * */

import { logMetricToFile } from '@/logMetrics.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export const syncDemandByPatternByYear = async () => {
	//

	LOGGER.title(`Sync Demand Metrics by Pattern by Year`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_pattern_by_year';

	//
	// Delete existing pattern metrics

	const deleteTimer = new TIMETRACKER();
	LOGGER.info(`Clearing existing '${METRIC}' metrics...`);
	metrics.deleteMany({ metric: METRIC });
	LOGGER.info(`Cleared existing metrics (${deleteTimer.get()})`);

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

	const patternMap = new Map<string, Metric>();

	const yearPromises = allTimestampChunks.map(async (chunkData) => {
		const chunkTimer = new TIMETRACKER();

		const year = new Date(chunkData.start).getFullYear();

		LOGGER.info(`Processing Year ${year}...`);

		//
		// Aggregate by pattern_id for this year

		const validationsAgg = await validationsCollection.aggregate([
			{
				$match: {
					created_at: { $gte: chunkData.start, $lt: chunkData.end },
					is_passenger: true,
				},
			},
			{
				$group: {
					_id: '$pattern_id',
					count: { $sum: 1 },
					pattern_id: { $first: '$pattern_id' },
				},
			},
		], { hint: 'is_passenger_1_pattern_id_1_created_at_1' }).toArray();

		LOGGER.info(`Year ${year} aggregation returned ${validationsAgg.length} pattern groups (${chunkTimer.get()})`);
		return { validationsAgg, year };
	});

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(yearPromises);

	for (const { validationsAgg, year } of allChunksResults) {
		for (const validation of validationsAgg) {
			const pattern_id = validation.pattern_id ?? 'no-pattern';

			if (!patternMap.has(pattern_id)) {
				patternMap.set(pattern_id, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passenger demand for pattern ${pattern_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { pattern_id },
				} as Metric);
			}

			const patternDoc = patternMap.get(pattern_id);
			patternDoc.data[year] = { qty: validation.count };
		}
	}

	const results = Array.from(patternMap.values());

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

	LOGGER.terminate(`Processed ${results.length} pattern results (${globalTimer.get()})`);
};

//
