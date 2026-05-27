import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics, rides } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByPatternHourByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern Hour by Day`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_pattern_hour_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch rides collection

	const ridesCollection = await rides.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await Dates.fetchCalendarData();

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		// convert date to YYYY-MM-DD format
		const formattedDate = `${day.date.slice(0, 4)}-${day.date.slice(4, 6)}-${day.date.slice(6, 8)}`;
		calendarMap.set(formattedDate, day);
	}

	//
	// Define operational daily chunks (04:00 → 04:00)

	const earliestDataNeeded = Dates
		.now('Europe/Lisbon')
		.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 });

	const latest = Dates.now('Europe/Lisbon')
		.set({ hour: 4, millisecond: 0, minute: 0, second: 0 })
		.plus({ days: 1 });

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
	// Set concurrency limit and batch processing

	const limit = pLimit(5); // Reduce concurrent queries
	const BATCH_SIZE = 50; // Process chunks in smaller batches
	const FLUSH_THRESHOLD = 10000; // Flush to DB when we have this many patterns

	//
	// Process chunks in batches to avoid memory issues

	const patternHourMap = new Map<string, Metric>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += BATCH_SIZE) {
		const batchChunks = allTimestampChunks.slice(i, i + BATCH_SIZE);

		Logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allTimestampChunks.length / BATCH_SIZE)} (chunks ${i + 1}-${Math.min(i + BATCH_SIZE, allTimestampChunks.length)})`);

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

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
							$group: {
								_id: {
									hour: { $hour: { $toDate: '$start_time_scheduled' } },
									line_id: '$line_id',
									minute: { $minute: { $toDate: '$start_time_scheduled' } },
									pattern_id: '$pattern_id',
								},
								hour: { $first: { $hour: { $toDate: '$start_time_scheduled' } } },
								line_id: { $first: '$line_id' },
								minute: { $first: { $minute: { $toDate: '$start_time_scheduled' } } },
								pattern_id: { $first: '$pattern_id' },
								total_passengers: { $sum: '$passengers_observed' },
							},
						},
					])
					.toArray();

				Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${ridesAgg.length} pattern-hour groups (${chunkTimer.get()})`);

				return { dayLabel, ridesAgg };
			}),
		);

		//
		// Process batch results

		const batchResults = await Promise.all(batchPromises);

		for (const { dayLabel, ridesAgg } of batchResults) {
			for (const ride of ridesAgg) {
				const key = `${ride.pattern_id}_${ride.hour}_${ride.minute}`;
				if (!patternHourMap.has(key)) {
					patternHourMap.set(key, {
						data: {} as Record<string, { qty: number }>,
						description: `Aggregated passengers for pattern ${ride.pattern_id} at ${ride.hour}:${ride.minute
							.toString()
							.padStart(2, '0')}`,
						generated_at: new Date(),
						metric: METRIC,
						properties: {
							hour: ride.hour,
							line_id: ride.line_id.toString(),
							minute: ride.minute,
							pattern_id: ride.pattern_id,
						},
					} as Metric);
				}

				const metric = patternHourMap.get(key);
				const calendarProps = calendarMap.get(dayLabel);

				metric.data[dayLabel] = {
					day_type: calendarProps.day_type,
					holiday: calendarProps.holiday,
					notes: calendarProps.notes,
					period: calendarProps.period,
					qty: ride.total_passengers,
				};
			}
		}

		totalProcessed += batchResults.reduce((sum, batch) => sum + batch.ridesAgg.length, 0);

		// Flush to database periodically to avoid memory issues
		if (patternHourMap.size >= FLUSH_THRESHOLD) {
			const flushTimer = new Timer();
			const results = Array.from(patternHourMap.values());

			Logger.info(`Flushing ${results.length} documents to database...`);
			await metrics.insertMany(results);
			Logger.info(`Flushed ${results.length} documents (${flushTimer.get()})`);

			patternHourMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (patternHourMap.size > 0) {
		const results = Array.from(patternHourMap.values());
		Logger.info(`Inserting final ${results.length} documents...`);
		await metrics.insertMany(results);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (batched)', key: 'loop_day_batched' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${totalProcessed} total pattern-hour combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};
