/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { type DemandByProductByAgencyByMonth, type DemandByProductByAgencyByYear } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncDemandByProductByAgencyByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Product by Agency by Year`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_product_by_agency_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: metricKey });
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
		const { agency_id: agencyId, product_id: productId } = monthlyMetric.properties;
		const key = `${productId}:${agencyId}`;

		// Initialize product-agency if not exists
		let productDoc = productMap.get(key);
		if (!productDoc) {
			productDoc = {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passengers for product ${productId} in agency ${agencyId}`,
				generated_at: new Date(),
				metric: metricKey,
				properties: {
					agency_id: agencyId,
					product_id: productId,
				},
			};
			productMap.set(key, productDoc);
		}

		// Aggregate monthly data into years
		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const yearKey = monthKey.slice(0, 4); // Extract YYYY from YYYY-MM

			// Initialize year if not exists
			if (!productDoc.data[yearKey]) {
				productDoc.data[yearKey] = { qty: 0 };
			}

			// Sum monthly quantity into yearly total
			productDoc.data[yearKey].qty += monthData.qty;
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
		metric: metricKey,
		queryCount: 1, // Only 1 query to fetch monthly metrics
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
