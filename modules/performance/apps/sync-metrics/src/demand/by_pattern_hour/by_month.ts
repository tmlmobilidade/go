import { logMetricToFile } from '@/logMetrics.js';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { Metric } from '@tmlmobilidade/types';
import { Dates } from '@tmlmobilidade/dates';
import { Logger } from '@tmlmobilidade/logger';
import TIMETRACKER from '@helperkits/timer';

/* * */

export const syncDemandByPatternHourByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern Hour by Month`);
	const globalTimer = new TIMETRACKER();

	const METRIC = 'demand_by_pattern_hour_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new TIMETRACKER();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// Define monthly chunks

	const earliestDataNeeded = Dates.now('Europe/Lisbon').set(
		{ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 },
	);

	const latest = Dates.now('Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.plus({ days: 1 });

	const allTimestampChunks: { end: number, start: number }[] = [];

	let cursor = earliestDataNeeded;
	while (cursor.unix_timestamp < latest.unix_timestamp) {
		const next = cursor.plus({ months: 1 });
		allTimestampChunks.push({
			end: next.unix_timestamp,
			start: cursor.unix_timestamp,
		});
		cursor = next;
	}

	//
	// Process each month in parallel

	const patternHourMap = new Map<string, Metric>();

	const monthPromises = allTimestampChunks.map(async (chunkData) => {
		const chunkTimer = new TIMETRACKER();

		const year = new Date(chunkData.start).getFullYear();
		const month = new Date(chunkData.start).getMonth() + 1;

		Logger.info(`Processing ${year}-${month.toString().padStart(2, '0')}...`);

		//
		// Aggregate by pattern_id + hour + minute

		const ridesAgg = await ridesCollection
			.aggregate([
				{
					$match: {
						passengers_observed: { $gt: 0 },
						start_time_scheduled: {
							$gte: chunkData.start,
							$lt: chunkData.end,
						},
					},
				},
				{
					$addFields: {
						start_time: { $toDate: '$start_time_scheduled' },
					},
				},
				{
					$group: {
						_id: {
							hour: { $hour: '$start_time' },
							minute: { $minute: '$start_time' },
							pattern_id: '$pattern_id',
						},
						hour: { $first: { $hour: '$start_time' } },
						minute: { $first: { $minute: '$start_time' } },
						pattern_id: { $first: '$pattern_id' },
						total_passengers: { $sum: '$passengers_observed' },
					},
				},
			])
			.toArray();

		Logger.info(
			`Month ${year}-${month.toString().padStart(2, '0')} aggregation returned ${ridesAgg.length} pattern-hour groups (${chunkTimer.get()})`,
		);

		return { month, ridesAgg, year };
	});

	const allChunksResults = await Promise.all(monthPromises);

	//
	// Transform into Metric objects

	for (const { month, ridesAgg, year } of allChunksResults) {
		for (const ride of ridesAgg) {
			const key = `${ride.pattern_id}_${ride.hour}_${ride.minute}`;
			if (!patternHourMap.has(key)) {
				patternHourMap.set(key, {
					data: {} as Record<string, { qty: number }>,
					description: `Aggregated passenger demand for pattern ${ride.pattern_id} at ${ride.hour}:${ride.minute
						.toString()
						.padStart(2, '0')}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: {
						hour: ride.hour,
						minute: ride.minute,
						pattern_id: ride.pattern_id,
					},
				} as Metric);
			}

			const metric = patternHourMap.get(key);
			const yearMonthKey = `${year}-${month.toString().padStart(2, '0')}`;
			metric.data[yearMonthKey] = { qty: ride.total_passengers };
		}
	}

	const results = Array.from(patternHourMap.values());

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
