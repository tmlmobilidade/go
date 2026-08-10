/* * */

import { Dates } from '@tmlmobilidade/dates';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByCategoryByAgencyByMonth } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByCategoryByAgencyByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Category by Agency by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_category_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC as 'demand_by_product_by_agency_by_month' });
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

	const categoryMap = new Map<string, DemandByCategoryByAgencyByMonth>();

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
						'metric': 'demand_by_category_by_agency_by_day',
						'properties.agency_id': { $ne: null },
						'properties.category': { $ne: null },
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
							agency_id: '$properties.agency_id',
							category: '$properties.category',
						},
						agency_id: { $first: '$properties.agency_id' },
						category: { $first: '$properties.category' },
						count: { $sum: '$dataEntries.v.qty' },
						month_year: { $first: yearMonth },
					},
				},
			]).toArray();

			Logger.info({ message: `Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Aggregated ${monthlyAgg.length} category-agency combinations from daily metrics (${chunkTimer.get()})` });
			return monthlyAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(monthPromises);

	for (const monthlyAgg of allChunksResults) {
		for (const monthData of monthlyAgg) {
			const category = monthData.category ?? 'prepaid';
			const agency_id = monthData.agency_id ?? 'no-agency';

			// Create unique key for each category-agency combination
			const categoryAgencyKey = `${category}:${agency_id}`;

			// Create or get category-agency document
			if (!categoryMap.has(categoryAgencyKey)) {
				categoryMap.set(categoryAgencyKey, {
					data: {},
					description: `Aggregated passengers for category ${category} in agency ${agency_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: {
						agency_id,
						category,
					},
				});
			}

			const categoryAgencyDoc = categoryMap.get(categoryAgencyKey);

			// Update individual category-agency data for this month
			categoryAgencyDoc.data[monthData.month_year] = {
				qty: monthData.count,
			};
		}
	}

	const results = Array.from(categoryMap.values());

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
