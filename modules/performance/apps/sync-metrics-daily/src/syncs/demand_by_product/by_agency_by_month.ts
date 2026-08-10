/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByProductByAgencyByMonth } from '@tmlmobilidade/types';

/* * */

const processBatch = (batch: DemandByProductByAgencyByMonth[], productMap: Map<string, DemandByProductByAgencyByMonth>) => {
	for (const dailyMetric of batch) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { agency_id, product_id } = (dailyMetric as any).properties;
		const key = `${product_id}:${agency_id}`;

		// Initialize product-agency if not exists
		if (!productMap.has(key)) {
			productMap.set(key, {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passengers for product ${product_id} in agency ${agency_id}`,
				generated_at: new Date(),
				metric: 'demand_by_product_by_agency_by_month',
				properties: {
					agency_id,
					product_id,
				},
			});
		}

		const productDoc = productMap.get(key);

		// Aggregate daily data into months
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const [dayKey, dayData] of Object.entries((dailyMetric as any).data)) {
			const monthKey = dayKey.slice(0, 7); // Extract YYYY-MM from YYYY-MM-DD

			// Initialize month if not exists
			if (!productDoc.data[monthKey]) {
				productDoc.data[monthKey] = { qty: 0 };
			}

			// Sum daily quantity into monthly total
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			productDoc.data[monthKey].qty += (dayData as any).qty;
		}
	}
};

/* * */

export const syncDemandByProductByAgencyByMonth = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Agency by Month`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_product_by_agency_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Process daily metrics into monthly aggregates using batched streaming

	const streamTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const productMap = new Map<string, DemandByProductByAgencyByMonth>();

	// Use batched approach - process in chunks to balance memory usage and performance
	const BATCH_SIZE = 1000;
	const cursor = metricsCollection.find({
		metric: 'demand_by_product_by_agency_by_day',
	});

	let processedCount = 0;
	let batch: DemandByProductByAgencyByMonth[] = [];

	for await (const dailyMetric of cursor) {
		batch.push(dailyMetric as DemandByProductByAgencyByMonth);

		// Process batch when it reaches the target size
		if (batch.length >= BATCH_SIZE) {
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

	Logger.info({ message: `Streamed and processed ${processedCount} daily metrics in batches of ${BATCH_SIZE} (${streamTimer.get()})` });

	const results = Array.from(productMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Stream daily metrics in batches and aggregate', key: 'batched_stream_aggregate' },
		metric: METRIC,
		queryCount: 1, // Only 1 cursor query
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
