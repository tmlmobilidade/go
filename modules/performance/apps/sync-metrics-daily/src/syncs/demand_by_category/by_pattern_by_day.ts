/* * */

import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByCategoryByPatternByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByCategoryByPatternByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Category by Pattern by Day`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_category_by_pattern_by_day';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC as 'demand_by_product_by_pattern_by_day' });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch validations collection

	const validationsCollection = await simplifiedApexValidations.getCollection();

	//
	// Load calendar JSON

	const calendarJson = await Dates.fetchCalendarData();

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
	// Set max concurrent queries and batch processing

	const limit = pLimit(5); // Reduce concurrent queries
	const BATCH_SIZE = 50; // Process chunks in smaller batches
	const FLUSH_THRESHOLD = 10000; // Flush to DB when we have this many combinations

	//
	// Process chunks in batches to avoid memory issues

	const categoryMap = new Map<string, DemandByCategoryByPatternByDay>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += BATCH_SIZE) {
		const batchChunks = allTimestampChunks.slice(i, i + BATCH_SIZE);

		Logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allTimestampChunks.length / BATCH_SIZE)} (chunks ${i + 1}-${Math.min(i + BATCH_SIZE, allTimestampChunks.length)})`);

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

				// Aggregation: Get counts by category and pattern for each day
				const validationsAgg = await validationsCollection.aggregate([
					{
						$match: {
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

				Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} category-pattern combinations (${chunkTimer.get()})`);
				return validationsAgg;
			}),
		);

		//
		// Process batch results

		const batchResults = await Promise.all(batchPromises);

		for (const validationsAgg of batchResults) {
			for (const validation of validationsAgg) {
				const category = validation.category ?? 'prepaid';
				const pattern_id = validation.pattern_id ?? 'no-pattern';

				// Create unique key for each category-pattern combination
				const categoryPatternKey = `${category}:${pattern_id}`;

				// Create or get category-pattern document
				if (!categoryMap.has(categoryPatternKey)) {
					categoryMap.set(categoryPatternKey, {
						data: {},
						description: `Aggregated passengers for category ${category} in pattern ${pattern_id}`,
						generated_at: new Date(),
						metric: METRIC,
						properties: {
							category,
							pattern_id,
						},
					});
				}

				const categoryPatternDoc = categoryMap.get(categoryPatternKey);
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
		if (categoryMap.size >= FLUSH_THRESHOLD) {
			const flushTimer = new Timer();
			const results = Array.from(categoryMap.values());

			Logger.info(`Flushing ${results.length} documents to database...`);
			await metrics.insertMany(results as unknown as Parameters<typeof metrics.insertMany>[0]);
			Logger.info(`Flushed ${results.length} documents (${flushTimer.get()})`);

			categoryMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (categoryMap.size > 0) {
		const results = Array.from(categoryMap.values());
		Logger.info(`Inserting final ${results.length} documents...`);
		await metrics.insertMany(results as unknown as Parameters<typeof metrics.insertMany>[0]);
	}

	logMetricToFile({
		approach: { description: 'Loop by day, aggregate on mongo (batched)', key: 'loop_day_batched' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${totalProcessed} total combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};
