/* * */

import { logMetricToFile } from '@/logMetrics.js';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncDemandByLineByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Line by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_line_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

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

	const lineMap = new Map<string, Metric>();

	const yearPromises = allTimestampChunks.map(async (chunkData) => {
		const chunkTimer = new Timer();

		const year = new Date(chunkData.start).getFullYear();

		Logger.info(`Processing Year ${year}...`);

		//
		// Aggregate by line_id for this year

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
					_id: '$line_id',
					count: { $sum: 1 },
					line_id: { $first: '$line_id' },
				},
			},
		], { hint: 'is_passenger_1_line_id_1_created_at_1' }).toArray();

		Logger.info(`Year ${year} aggregation returned ${validationsAgg.length} line groups (${chunkTimer.get()})`);
		return { validationsAgg, year };
	});

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(yearPromises);

	for (const { validationsAgg, year } of allChunksResults) {
		for (const validation of validationsAgg) {
			const line_id = validation.line_id ?? 'no-line';
			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passenger demand for line ${line_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: { line_id },
				} as Metric);
			}

			const lineDoc = lineMap.get(line_id);
			lineDoc.data[year] = { qty: validation.count };
		}
	}

	const results = Array.from(lineMap.values());

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

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
