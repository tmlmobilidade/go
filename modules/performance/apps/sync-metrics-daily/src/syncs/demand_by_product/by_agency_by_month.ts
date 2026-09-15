/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type DemandByProductByAgencyByDay, type DemandByProductByAgencyByMonth } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

const processBatch = (batch: DemandByProductByAgencyByDay[], productMap: Map<string, DemandByProductByAgencyByMonth>) => {
	for (const dailyMetric of batch) {
		const { agency_id: agencyId, product_id: productId } = dailyMetric.properties;
		const key = `${productId}:${agencyId}`;

		// Initialize product-agency if not exists
		let productDoc = productMap.get(key);
		if (!productDoc) {
			productDoc = {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passengers for product ${productId} in agency ${agencyId}`,
				generated_at: new Date(),
				metric: 'demand_by_product_by_agency_by_month',
				properties: {
					agency_id: agencyId,
					product_id: productId,
				},
			};
			productMap.set(key, productDoc);
		}

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!productDoc.data[monthKey]) {
				productDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			productDoc.data[monthKey].qty += dayData.qty;
		}
	}
};

/* * */

export const syncDemandByProductByAgencyByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Agency by Month`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_product_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: metricKey });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Process daily metrics into monthly aggregates using batched streaming

	const streamTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const productMap = new Map<string, DemandByProductByAgencyByMonth>();

	// Use batched approach - process in chunks to balance memory usage and performance
	const batchSize = 1000;
	const cursor = metricsCollection.find({
		metric: 'demand_by_product_by_agency_by_day',
	});

	let processedCount = 0;
	let batch: DemandByProductByAgencyByDay[] = [];

	for await (const dailyMetric of cursor) {
		batch.push(dailyMetric as DemandByProductByAgencyByDay);

		// Process batch when it reaches the target size
		if (batch.length >= batchSize) {
			processBatch(batch, productMap);
			processedCount += batch.length;
			Logger.info({ message: `Processed ${processedCount} daily metrics...` });
			batch = []; // Clear batch
		}
	}

	// Process remaining items in the final batch
	if (batch.length > 0) {
		processBatch(batch, productMap);
		processedCount += batch.length;
	}

	Logger.info({ message: `Streamed and processed ${processedCount} daily metrics in batches of ${batchSize} (${streamTimer.get()})` });

	const results = Array.from(productMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Stream daily metrics in batches and aggregate', key: 'batched_stream_aggregate' },
		metric: metricKey,
		queryCount: 1, // Only 1 cursor query
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
