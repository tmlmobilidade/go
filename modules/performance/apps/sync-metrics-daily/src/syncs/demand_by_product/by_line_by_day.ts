/* * */

import { type CalendarEntry, Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics, simplifiedApexValidations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByProductByLineByDay } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByProductByLineByDay = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Line by Day`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_product_by_line_by_day';

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

	const productMap = new Map<string, DemandByProductByLineByDay>();
	let totalProcessed = 0;

	for (let i = 0; i < allTimestampChunks.length; i += BATCH_SIZE) {
		const batchChunks = allTimestampChunks.slice(i, i + BATCH_SIZE);

		Logger.info(`Processing batch ${Math.floor(i / BATCH_SIZE) + 1}/${Math.ceil(allTimestampChunks.length / BATCH_SIZE)} (chunks ${i + 1}-${Math.min(i + BATCH_SIZE, allTimestampChunks.length)})`);

		const batchPromises = batchChunks.map((chunkData, batchIndex) =>
			limit(async () => {
				const chunkTimer = new Timer();
				const chunkIndex = i + batchIndex;

				const dayLabel = new Date(chunkData.start).toISOString().slice(0, 10);

				// Aggregation: Get counts by product and line for each day
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
								line_id: '$line_id',
								product_id: '$product_id',
							},
							count: { $sum: 1 },
							day: { $first: dayLabel },
							line_id: { $first: '$line_id' },
							product_id: { $first: '$product_id' },
						},
					},
				], { hint: 'is_passenger_1_agency_id_1_created_at_1' }).toArray();

				Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Found ${validationsAgg.length} product-line combinations (${chunkTimer.get()})`);
				return validationsAgg;
			}),
		);

		//
		// Process batch results

		const batchResults = await Promise.all(batchPromises);

		for (const validationsAgg of batchResults) {
			for (const validation of validationsAgg) {
				const product_id = validation.product_id ?? 'unknown-product';
				const line_id = validation.line_id ?? 'no-line';

				// Create unique key for each product-line combination
				const productLineKey = `${product_id}:${line_id}`;

				// Create or get product-line document
				if (!productMap.has(productLineKey)) {
					productMap.set(productLineKey, {
						data: {},
						description: `Aggregated passengers for product ${product_id} on line ${line_id}`,
						generated_at: new Date(),
						metric: METRIC,
						properties: {
							line_id,
							product_id,
						},
					});
				}

				const productLineDoc = productMap.get(productLineKey);
				const calendarProps = calendarMap.get(validation.day);

				// Update individual product-line data
				productLineDoc.data[validation.day] = {
					day_type: calendarProps?.day_type || '1',
					holiday: calendarProps?.holiday || '0',
					notes: calendarProps?.notes || '',
					period: calendarProps?.period || '1',
					qty: validation.count,
				};
			}
		}

		totalProcessed += batchResults.reduce((sum, batch) => sum + batch.length, 0);

		// Flush to database periodically to avoid memory issues
		if (productMap.size >= FLUSH_THRESHOLD) {
			const flushTimer = new Timer();
			const results = Array.from(productMap.values());

			Logger.info(`Flushing ${results.length} documents to database...`);
			await metrics.insertMany(results);
			Logger.info(`Flushed ${results.length} documents (${flushTimer.get()})`);

			productMap.clear(); // Free memory
		}
	}

	//
	// Insert remaining metrics

	if (productMap.size > 0) {
		const results = Array.from(productMap.values());
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

	Logger.terminate(`Processed ${totalProcessed} total combinations from ${allTimestampChunks.length} chunks (${globalTimer.get()})`);
};

//
