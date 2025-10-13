/* * */

import { logMetricToFile } from '@/logMetrics.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';

/* * */

export const syncDemandByLineByMonth = async () => {
	//

	LOGGER.title(`Sync Demand Metrics by Line by Month`);
	const globalTimer = new TIMETRACKER();

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	LOGGER.info(`Clearing existing 'demand_by_line_by_month' metrics...`);
	metrics.deleteMany({ metric: 'demand_by_line_by_month' });
	LOGGER.info(`Cleared existing metrics (${deleteTimer.get()})`);

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

	const lineMap = new Map<string, Metric>();

	const monthPromises = allTimestampChunks.map(async (chunkData, chunkIndex) => {
		const chunkTimer = new TIMETRACKER();
		const chunkStartDate = Dates.fromUnixTimestamp(chunkData.start).setZone('Europe/Lisbon', 'offset_only');
		const chunkEndDate = Dates.fromUnixTimestamp(chunkData.end).setZone('Europe/Lisbon', 'offset_only');
		const yearMonth = new Date(chunkStartDate.unix_timestamp).toISOString().slice(0, 7);

		//
		// Aggregation per month (group by line_id)

		const validationsAgg = await validationsCollection.aggregate([
			{
				$match: {
					created_at: { $gte: chunkStartDate.unix_timestamp, $lt: chunkEndDate.unix_timestamp },
					is_passenger: true,
				},
			},
			{
				$project: {
					_id: '$_id',
					line_id: '$line_id',
					month_year: { $literal: yearMonth },
				},
			},
			{
				$group: {
					_id: '$line_id',
					count: { $sum: 1 },
					line_id: { $first: '$line_id' },
					month_year: { $first: '$month_year' },
				},
			},
		]).toArray();

		LOGGER.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} lines (${chunkTimer.get()})`);
		return validationsAgg;
	});

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(monthPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const line_id = validation.line_id ?? 'no-line';
			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passenger demand for line ${line_id}`,
					generated_at: new Date(),
					metric: 'demand_by_line_by_month',
					properties: {
						interval: 300_000,
						line_id,
					},
				} as Metric);
			}
			const lineDoc = lineMap.get(line_id);
			lineDoc.data[validation.month_year] = { qty: validation.count };
		}
	}

	const results = Array.from(lineMap.values());
	LOGGER.info(`Sample results: ${JSON.stringify(results.slice(0, 2), null, 2)}`);

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by month, aggregate on mongo (parallel)', key: 'loop_month_parallel' },
		metric: 'demand_by_line_by_month',
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	LOGGER.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
