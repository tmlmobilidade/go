/* * */

import { Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByProductByPatternByMonth } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByProductByPatternByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Pattern by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_product_by_pattern_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC as 'demand_by_product_by_line_by_month' });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch existing daily metrics collection (more efficient than raw validations)

	const metricsCollection = await metrics.getCollection();
	Logger.info({ message: 'Using daily metrics for aggregation (optimized approach)' });

	//
	// Define monthly chunks

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
	// Set max concurrent queries

	const limit = pLimit(10);

	//
	// Process each month in parallel

	const productMap = new Map<string, DemandByProductByPatternByMonth>();

	const monthPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();

			const yearMonth = new Date(chunkData.start).toISOString().slice(0, 7);
			const monthStart = new Date(chunkData.start).toISOString().slice(0, 10);
			const monthEnd = new Date(chunkData.end).toISOString().slice(0, 10);

			// Optimized: Aggregate from daily metrics instead of raw validations
			const monthlyAgg = await metricsCollection.aggregate([
				{
					$match: {
						'metric': 'demand_by_product_by_pattern_by_day',
						'properties.pattern_id': { $ne: null },
						'properties.product_id': { $ne: null },
					},
				},
				{
					$addFields: {
						// Convert data object to array for easier processing
						dataEntries: { $objectToArray: '$data' },
					},
				},
				{
					$unwind: '$dataEntries',
				},
				{
					$match: {
						'dataEntries.k': { $gte: monthStart, $lt: monthEnd },
					},
				},
				{
					$group: {
						_id: {
							pattern_id: '$properties.pattern_id',
							product_id: '$properties.product_id',
						},
						count: { $sum: '$dataEntries.v.qty' },
						month_year: { $first: yearMonth },
						pattern_id: { $first: '$properties.pattern_id' },
						product_id: { $first: '$properties.product_id' },
					},
				},
			]).toArray();

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Aggregated ${monthlyAgg.length} product-pattern combinations from daily metrics (${chunkTimer.get()})` });
			return monthlyAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(monthPromises);

	for (const monthlyAgg of allChunksResults) {
		for (const monthData of monthlyAgg) {
			const product_id = monthData.product_id ?? 'unknown-product';
			const pattern_id = monthData.pattern_id ?? 'no-pattern';

			// Create unique key for each product-pattern combination
			const productPatternKey = `${product_id}:${pattern_id}`;

			// Create or get product-pattern document
			if (!productMap.has(productPatternKey)) {
				productMap.set(productPatternKey, {
					data: {},
					description: `Aggregated passengers for product ${product_id} on pattern ${pattern_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: {
						pattern_id,
						product_id,
					},
				});
			}

			const productPatternDoc = productMap.get(productPatternKey);

			// Update individual product-pattern data for this month
			productPatternDoc.data[monthData.month_year] = {
				qty: monthData.count,
			};
		}
	}

	const results = Array.from(productMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results as unknown as Parameters<typeof metrics.insertMany>[0]);

	logMetricToFile({
		approach: { description: 'Loop by month, aggregate from daily metrics (parallel)', key: 'loop_month_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
