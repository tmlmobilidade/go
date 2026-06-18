/* * */

import { Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByCategoryByLineByYear } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByCategoryByLineByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Category by Line by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_category_by_line_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC as 'demand_by_product_by_line_by_year' });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch existing monthly metrics collection (more efficient than raw validations)

	const metricsCollection = await metrics.getCollection();
	Logger.info({ message: 'Using monthly metrics for aggregation (optimized approach)' });

	//
	// Define yearly chunks

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
		const next = cursor.plus({ years: 1 });
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
	// Process each year in parallel

	const categoryMap = new Map<string, DemandByCategoryByLineByYear>();

	const yearPromises = allTimestampChunks.map((chunkData, chunkIndex) =>
		limit(async () => {
			const chunkTimer = new Timer();

			const yearNum = new Date(chunkData.start).getFullYear();
			const year = yearNum.toString();
			const yearStart = `${yearNum}-01`;
			const yearEnd = `${yearNum + 1}-01`;

			// Optimized: Aggregate from monthly metrics instead of raw validations
			const yearlyAgg = await metricsCollection.aggregate([
				{
					$match: {
						'metric': 'demand_by_category_by_line_by_month',
						'properties.category': { $ne: null },
						'properties.line_id': { $ne: null },
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
						'dataEntries.k': { $gte: yearStart, $lt: yearEnd },
					},
				},
				{
					$group: {
						_id: {
							category: '$properties.category',
							line_id: '$properties.line_id',
						},
						category: { $first: '$properties.category' },
						count: { $sum: '$dataEntries.v.qty' },
						line_id: { $first: '$properties.line_id' },
						year: { $first: year },
					},
				},
			]).toArray();

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Aggregated ${yearlyAgg.length} category-line combinations from monthly metrics (${chunkTimer.get()})` });
			return yearlyAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(yearPromises);

	for (const yearlyAgg of allChunksResults) {
		for (const yearData of yearlyAgg) {
			const category = yearData.category ?? 'prepaid';
			const line_id = yearData.line_id ?? 'no-line';

			// Create unique key for each category-line combination
			const categoryLineKey = `${category}:${line_id}`;

			// Create or get category-line document
			if (!categoryMap.has(categoryLineKey)) {
				categoryMap.set(categoryLineKey, {
					data: {},
					description: `Aggregated passengers for category ${category} in line ${line_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: {
						category,
						line_id,
					},
				});
			}

			const categoryLineDoc = categoryMap.get(categoryLineKey);

			// Update individual category-line data for this year
			categoryLineDoc.data[yearData.year] = {
				qty: yearData.count,
			};
		}
	}

	const results = Array.from(categoryMap.values());

	//
	// Insert all metrics

	await metrics.insertMany(results);

	logMetricToFile({
		approach: { description: 'Loop by year, aggregate from monthly metrics (parallel)', key: 'loop_year_parallel' },
		metric: METRIC,
		queryCount: allTimestampChunks.length,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};
