/* * */

import { logMetricToFile } from '@/logMetrics.js';
import { Dates } from '@tmlmobilidade/dates';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByProductByAgencyByYear } from '@tmlmobilidade/types';
import pLimit from 'p-limit';

/* * */

export const syncDemandByProductByAgencyByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Agency by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_product_by_agency_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info(`Clearing existing '${METRIC}' metrics...`);
	await metrics.deleteMany({ metric: METRIC });
	Logger.info(`Cleared existing metrics in ${deleteTimer.get()}`);

	//
	// Fetch existing monthly metrics collection (more efficient than raw validations)

	const metricsCollection = await metrics.getCollection();
	Logger.info('Using monthly metrics for aggregation (optimized approach)');

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

	const productMap = new Map<string, DemandByProductByAgencyByYear>();

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
						'metric': 'demand_by_product_by_agency_by_month',
						'properties.agency_id': { $ne: null },
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
						'dataEntries.k': { $gte: yearStart, $lt: yearEnd },
					},
				},
				{
					$group: {
						_id: {
							agency_id: '$properties.agency_id',
							product_id: '$properties.product_id',
						},
						agency_id: { $first: '$properties.agency_id' },
						count: { $sum: '$dataEntries.v.qty' },
						product_id: { $first: '$properties.product_id' },
						year: { $first: year },
					},
				},
			]).toArray();

			Logger.info(`Chunk ${chunkIndex + 1}/${allTimestampChunks.length} - Aggregated ${yearlyAgg.length} product-agency combinations from monthly metrics (${chunkTimer.get()})`);
			return yearlyAgg;
		}),
	);

	//
	// Transform into Metric objects

	const allChunksResults = await Promise.all(yearPromises);

	for (const yearlyAgg of allChunksResults) {
		for (const yearData of yearlyAgg) {
			const product_id = yearData.product_id ?? 'unknown-product';
			const agency_id = yearData.agency_id ?? 'no-agency';

			// Create unique key for each product-agency combination
			const productAgencyKey = `${product_id}:${agency_id}`;

			// Create or get product-agency document
			if (!productMap.has(productAgencyKey)) {
				productMap.set(productAgencyKey, {
					data: {},
					description: `Aggregated passengers for product ${product_id} in agency ${agency_id}`,
					generated_at: new Date(),
					metric: METRIC,
					properties: {
						agency_id,
						product_id,
					},
				});
			}

			const productAgencyDoc = productMap.get(productAgencyKey);

			// Update individual product-agency data for this year
			productAgencyDoc.data[yearData.year] = {
				qty: yearData.count,
			};
		}
	}

	const results = Array.from(productMap.values());

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

//
