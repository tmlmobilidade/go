import { goDb } from '@tmlmobilidade/go-interfaces-godb';
/* * */

import { GO_CM_AGENCY_IDS } from '@/constants.js';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type PerformanceCalendarEntry as CalendarEntry, fetchPerformanceCalendar } from '@tmlmobilidade/go-performance-pckg-scripts';
import { type DemandByProductByPatternByDay } from '@tmlmobilidade/go-types-performance';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';
import pLimit from 'p-limit';

/* * */

export const syncDemandByProductByPatternByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Pattern by Day`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_product_by_pattern_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await goDb.performance.metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Read migrated validations through labDb.

	//
	// Load calendar JSON

	const calendarJson = await fetchPerformanceCalendar();

	//
	// Build a map for fast lookup

	const calendarMap = new Map<string, CalendarEntry>();
	for (const day of calendarJson) {
		const dayString = day.date.toString();
		// convert date to YYYY-MM-DD format
		const formattedDate = `${dayString.slice(0, 4)}-${dayString.slice(4, 6)}-${dayString.slice(6, 8)}`;
		calendarMap.set(formattedDate, day);
	}

	//
	// Define daily chunks

	const earliestDataNeeded = Dates
		.now('Europe/Lisbon')
		.set({ day: 1, hour: 4, millisecond: 0, minute: 0, month: 1, second: 0, year: 2024 });

	const latest = Dates
		.now('Europe/Lisbon')
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
	// Set max concurrent queries and batch processing

	const limit = pLimit(5); // Reduce concurrent queries
	const batchSize = 50; // Process chunks in smaller batches
	const flushThreshold = 10000; // Flush to DB when we have this many combinations

	//
	// Process chunks in batches to avoid memory issues

	const productMap = new Map<string, DemandByProductByPatternByDay>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += batchSize) {
		const batchChunks = allTimestampChunks.slice(i, i + batchSize);

		Logger.info({ message: `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTimestampChunks.length / batchSize)} (chunks ${i + 1}-${Math.min(i + batchSize, allTimestampChunks.length)})` });

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

				// Aggregation: Get counts by product and pattern for each day
				const validationsAgg = await labDb.queryFromString<{ count: number, day: string, pattern_id: null | string, product_id: null | string }>(
					`SELECT pattern_id AS pattern_id, product_id, toFloat64(count()) AS count, $4 AS day
					 FROM simplified_apex.validations AS v FINAL
					 WHERE created_at >= $1 AND created_at < $2
					   AND v.agency_id IN $3 AND is_passenger = 1
					 GROUP BY pattern_id, product_id`,
					{ 1: chunkData.start, 2: chunkData.end, 3: [...GO_CM_AGENCY_IDS], 4: dayLabel },
				);

				Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} product-pattern combinations (${chunkTimer.get()})` });
				return validationsAgg;
			}),
		);

		//
		// Process batch results

		const batchResults = await Promise.all(batchPromises);

		for (const validationsAgg of batchResults) {
			for (const validation of validationsAgg) {
				const productId = validation.product_id ?? 'unknown-product';
				const patternId = validation.pattern_id ?? 'no-pattern';

				// Create unique key for each product-pattern combination
				const productPatternKey = `${productId}:${patternId}`;

				// Create or get product-pattern document
				if (!productMap.has(productPatternKey)) {
					productMap.set(productPatternKey, {
						data: {},
						description: `Aggregated passengers for product ${productId} on pattern ${patternId}`,
						generated_at: new Date(),
						metric: metricKey,
						properties: {
							pattern_id: patternId,
							product_id: productId,
						},
					});
				}

				const productPatternDoc = productMap.get(productPatternKey);
				if (!productPatternDoc) throw new Error('Metric group was not initialized');
				const calendarProps = calendarMap.get(validation.day);

				// Update individual product-pattern data
				productPatternDoc.data[validation.day] = {
					day_type: calendarProps?.day_type || '1',
					holiday: calendarProps?.holiday === '1',
					notes: calendarProps?.notes || '',
					period: calendarProps?.period || '1',
					qty: validation.count,
				};
			}
		}

		totalProcessed += batchResults.reduce((sum, batch) => sum + batch.length, 0);

		// Flush to database periodically to avoid memory issues
		if (productMap.size >= flushThreshold) {
			const flushTimer = new Timer();
			const results = Array.from(productMap.values());

			Logger.info({ message: `Flushing ${results.length} documents to database...` });
			await goDb.performance.metrics.insertMany(results);
			Logger.info({ message: `Flushed ${results.length} documents (${flushTimer.get()})` });

			productMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (productMap.size > 0) {
		const results = Array.from(productMap.values());
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

	Logger.terminate(`Processed ${totalProcessed} total combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};

//
