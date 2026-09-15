/* * */

import { LEGACY_CM_AGENCY_IDS } from '@/constants.js';
import { buildCalendarMap, fetchCalendarData } from '@/utils/fetch-calendar-data.js';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type DemandByCategoryByPatternByDay } from '@tmlmobilidade/go-types-performance';
import { Dates } from '@tmlmobilidade/go-utils-dates';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import pLimit from 'p-limit';

/* * */

export const syncDemandByCategoryByPatternByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Category by Pattern by Day`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_category_by_pattern_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${metricKey}' metrics...` });
	await metrics.deleteMany({ metric: metricKey as 'demand_by_product_by_pattern_by_day' });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await fetchCalendarData();

	//
	// Build a map for fast lookup

	const calendarMap = buildCalendarMap(calendarJson);

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
		allTimestampChunks.push({
			end: next.unix_milliseconds,
			endIso: next.iso ?? '',
			start: cursor.unix_milliseconds,
			startIso: cursor.iso ?? '',
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

	const categoryMap = new Map<string, DemandByCategoryByPatternByDay>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += batchSize) {
		const batchChunks = allTimestampChunks.slice(i, i + batchSize);

		Logger.info({ message: `Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(allTimestampChunks.length / batchSize)} (chunks ${i + 1}-${Math.min(i + batchSize, allTimestampChunks.length)})` });

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

				// Aggregation: Get counts by category and pattern for each day
				const validationsAgg = await validationsCollection.aggregate([
					{
						$match: {
							agency_id: { $in: [...LEGACY_CM_AGENCY_IDS] },
							created_at: { $gte: chunkData.start, $lt: chunkData.end },
							is_passenger: true,
						},
					},
					{
						$group: {
							_id: {
								category: '$category',
								pattern_id: '$pattern_id',
							},
							category: { $first: '$category' },
							count: { $sum: 1 },
							day: { $first: dayLabel },
							pattern_id: { $first: '$pattern_id' },
						},
					},
				], { hint: 'is_passenger_1_pattern_id_1_created_at_1' }).toArray();

				Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} category-pattern combinations (${chunkTimer.get()})` });
				return validationsAgg;
			}),
		);

		//
		// Process batch results

		const batchResults = await Promise.all(batchPromises);

		for (const validationsAgg of batchResults) {
			for (const validation of validationsAgg) {
				const category = validation.category ?? 'prepaid';
				const patternId = validation.pattern_id ?? 'no-pattern';

				// Create unique key for each category-pattern combination
				const categoryPatternKey = `${category}:${patternId}`;

				// Create or get category-pattern document
				let categoryPatternDoc = categoryMap.get(categoryPatternKey);
				if (!categoryPatternDoc) {
					categoryPatternDoc = {
						data: {},
						description: `Aggregated passengers for category ${category} in pattern ${patternId}`,
						generated_at: new Date(),
						metric: metricKey,
						properties: {
							category,
							pattern_id: patternId,
						},
					};
					categoryMap.set(categoryPatternKey, categoryPatternDoc);
				}
				const calendarProps = calendarMap.get(validation.day);

				// Update individual category-pattern data
				categoryPatternDoc.data[validation.day] = {
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
		if (categoryMap.size >= flushThreshold) {
			const flushTimer = new Timer();
			const results = Array.from(categoryMap.values());

			Logger.info({ message: `Flushing ${results.length} documents to database...` });
			await metrics.insertMany(results as unknown as Parameters<typeof metrics.insertMany>[0]);
			Logger.info({ message: `Flushed ${results.length} documents (${flushTimer.get()})` });

			categoryMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (categoryMap.size > 0) {
		const results = Array.from(categoryMap.values());
		Logger.info({ message: `Inserting final ${results.length} documents...` });
		await metrics.insertMany(results as unknown as Parameters<typeof metrics.insertMany>[0]);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (batched)', key: 'loop_day_batched' },
		metric: metricKey,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${totalProcessed} total combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};
