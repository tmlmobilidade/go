import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type PerformanceCalendarEntry as CalendarEntry, fetchPerformanceCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';
import { Metric } from '@tmlmobilidade/go-types-performance';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

export const syncDemandByPatternHourByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern Hour by Day`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_pattern_hour_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await goDb.performance.metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch rides collection

	// Rides and their analyses are stored in ClickHouse.

	//
	// Load calendar JSON

	const calendarJson = await fetchPerformanceCalendar();

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		// convert date to YYYY-MM-DD format
		const formattedDate = `${String(day.date).slice(0, 4)}-${String(day.date).slice(4, 6)}-${String(day.date).slice(6, 8)}`;
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

	while (cursor.unix_milliseconds < latest.unix_milliseconds) {
		const next = cursor.plus({ days: 1 });
		if (!cursor.iso || !next.iso) throw new Error('Invalid metric date range');
		allTimestampChunks.push({
			end: next.unix_milliseconds,
			endIso: next.iso,
			start: cursor.unix_milliseconds,
			startIso: cursor.iso,
		});
		cursor = next;
	}

	//
	// Set concurrency limit and batch processing

	const limit = pLimit(5); // Reduce concurrent queries
	const batchSize = 50; // Process chunks in smaller batches
	const flushThreshold = 10000; // Flush to DB when we have this many patterns

	//
	// Process chunks in batches to avoid memory issues

	const patternHourMap = new Map<string, Metric>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += batchSize) {
		const batchChunks = allTimestampChunks.slice(i, i + batchSize);

		Logger.info({ message: `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTimestampChunks.length / batchSize)} (chunks ${i + 1}-${Math.min(i + batchSize, allTimestampChunks.length)})` });

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

				const ridesAgg = await labDb.queryFromString<{
					hour: number
					line_id: string
					minute: number
					pattern_id: string
					total_passengers: number
				}>(
					`SELECT toHour(fromUnixTimestamp64Milli(start_time_scheduled, 'UTC')) AS hour,
					        toMinute(fromUnixTimestamp64Milli(start_time_scheduled, 'UTC')) AS minute,
					        route_short_name AS line_id, shape_id AS pattern_id,
					        toFloat64(sum(passengers_observed)) AS total_passengers
					 FROM operation.rides FINAL
					 WHERE agency_id IN $3 AND passengers_observed > 0
					   AND start_time_scheduled >= $1 AND start_time_scheduled < $2
					 GROUP BY hour, minute, route_short_name, shape_id`,
					{ 1: chunkData.start, 2: chunkData.end, 3: [...GO_CM_AGENCY_IDS] },
				);

				Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${ridesAgg.length} pattern-hour groups (${chunkTimer.get()})` });

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
						metric: metricKey,
						properties: {
							hour: ride.hour,
							line_id: ride.line_id.toString(),
							minute: ride.minute,
							pattern_id: ride.pattern_id,
						},
					} as Metric);
				}

				const metric = patternHourMap.get(key);
				if (!metric) throw new Error('Metric group was not initialized');
				const calendarProps = calendarMap.get(dayLabel);
				if (!calendarProps) throw new Error(`Calendar entry unavailable for ${dayLabel}`);

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
		if (patternHourMap.size >= flushThreshold) {
			const flushTimer = new Timer();
			const results = Array.from(patternHourMap.values());

			Logger.info({ message: `Flushing ${results.length} documents to database...` });
			await goDb.performance.metrics.insertMany(results);
			Logger.info({ message: `Flushed ${results.length} documents (${flushTimer.get()})` });

			patternHourMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (patternHourMap.size > 0) {
		const results = Array.from(patternHourMap.values());
		Logger.info({ message: `Inserting final ${results.length} documents...` });
		await goDb.performance.metrics.insertMany(results);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate in ClickHouse (batched)', key: 'loop_day_batched' },
		metric: metricKey,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${totalProcessed} total pattern-hour combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};
