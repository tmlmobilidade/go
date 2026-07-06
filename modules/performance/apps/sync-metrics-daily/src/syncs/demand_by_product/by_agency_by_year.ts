/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type DemandByProductByAgencyByMonth, type DemandByProductByAgencyByYear } from '@tmlmobilidade/types';

/* * */

export const syncDemandByProductByAgencyByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Agency by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_product_by_agency_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch by_month metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const monthlyMetrics = await metricsCollection.find({
		metric: 'demand_by_product_by_agency_by_month',
	}).toArray() as DemandByProductByAgencyByMonth[];

	Logger.info({ message: `Fetched ${monthlyMetrics.length} monthly metrics (${fetchTimer.get()})` });

	//
	// Process monthly metrics into yearly aggregates

	const productMap = new Map<string, DemandByProductByAgencyByYear>();

	for (const monthlyMetric of monthlyMetrics) {
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		const { agency_id, product_id } = (monthlyMetric as any).properties;
		const key = `${product_id}:${agency_id}`;

		// Initialize product-agency if not exists
		if (!productMap.has(key)) {
			productMap.set(key, {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passengers for product ${product_id} in agency ${agency_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: {
					agency_id,
					product_id,
				},
			});
		}

		const productDoc = productMap.get(key);

		// Aggregate monthly data into years
		// eslint-disable-next-line @typescript-eslint/no-explicit-any
		for (const [monthKey, monthData] of Object.entries((monthlyMetric as any).data)) {
			const yearKey = monthKey.slice(0, 4); // Extract YYYY from YYYY-MM

			// Initialize year if not exists
			if (!productDoc.data[yearKey]) {
				productDoc.data[yearKey] = { qty: 0 };
			}

			// Sum monthly quantity into yearly total
			// eslint-disable-next-line @typescript-eslint/no-explicit-any
			productDoc.data[yearKey].qty += (monthData as any).qty;
		}
	}

	const results = Array.from(productMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} yearly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_month metrics', key: 'aggregate_from_monthly' },
		metric: METRIC,
		queryCount: 1, // Only 1 query to fetch monthly metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
