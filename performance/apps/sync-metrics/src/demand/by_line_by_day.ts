/* * */

import { logMetricToFile } from '@/logMetrics.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/utils';
import pLimit from 'p-limit';

/* * */

export const syncDemandByLineByDay = async () => {
	//

	LOGGER.title(`Sync Demand Metrics by Line by Day`);
	const globalTimer = new TIMETRACKER();

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	LOGGER.info(`Clearing existing 'demand_by_line_by_day' metrics...`);
	metrics.deleteMany({ metric: 'demand_by_line_by_day' });
	LOGGER.info(`Cleared existing metrics (${deleteTimer.get()})`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Define daily chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon').set({ hour: 4, millisecond: 0, minute: 0, second: 0 }).plus({ days: 1 });

	const allTimestampChunks: { end: number, endIso: string, start: number, startIso: string }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ days: 1 });
		allTimestampChunks.push({
			end: next.unix_timestamp,
			endIso: next.iso,
			start: cursor.unix_timestamp,
			startIso: cursor.iso,
		});
		cursor = next;
	}

	//
	// Process each year in parallel
	const lineMap = new Map<string, Metric>();

	//
	// Set max concurrent queries
	const limit = pLimit(10);

	const dayPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new TIMETRACKER();

			const chunkStartDate = Dates.fromUnixTimestamp(chunkData.start).setZone('Europe/Lisbon', 'offset_only');
			const chunkEndDate = Dates.fromUnixTimestamp(chunkData.end).setZone('Europe/Lisbon', 'offset_only');

			const dayLabel = new Date(chunkStartDate.unix_timestamp).toISOString().slice(0, 10);

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
						day: { $literal: dayLabel },
						line_id: '$line_id',
					},
				},
				{
					$group: {
						_id: '$line_id',
						count: { $sum: 1 },
						day: { $first: '$day' },
						line_id: { $first: '$line_id' },
					},
				},
			]).toArray();

			LOGGER.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} lines (${chunkTimer.get()})`);
			return validationsAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(dayPromises);

	for (const validationsAgg of allChunksResults) {
		for (const validation of validationsAgg) {
			const line_id = validation.line_id ?? 'no-line';
			if (!lineMap.has(line_id)) {
				lineMap.set(line_id, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passengers for the line ${line_id}`,
					generated_at: new Date(),
					metric: 'demand_by_line_by_day',
					properties: { interval: 300_000, line_id },
				} as Metric);
			}
			const lineDoc = lineMap.get(line_id);
			lineDoc.data[validation.day] = { qty: validation.count };
		}
	}

	const results = Array.from(lineMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (parallel)', key: 'loop_day_parallel' },
		metric: 'demand_by_line_by_day',
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	LOGGER.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
