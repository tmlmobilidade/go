/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { DemandByLineByMonth, Metric } from '@tmlmobilidade/go-types-performance';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

export const syncDemandByLineByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Line by Year`);
	const globalTimer = new Timer();

	const metricKey = 'demand_by_line_by_year';

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
		metric: 'demand_by_line_by_month',
	}).toArray() as DemandByLineByMonth[];

	Logger.info({ message: `Fetched ${monthlyMetrics.length} monthly metrics (${fetchTimer.get()})` });

	//
	// Process monthly metrics into yearly aggregates

	const lineMap = new Map<string, Metric>();

	for (const monthlyMetric of monthlyMetrics) {
		const lineId = monthlyMetric.properties.line_id;

		// Initialize line if not exists
		let lineDoc = lineMap.get(lineId);
		if (!lineDoc) {
			lineDoc = {
				data: {} as Record<string, { qty: number }>,
				description: `Aggregated passenger demand for line ${lineId}`,
				generated_at: new Date(),
				metric: metricKey,
				properties: { line_id: lineId },
			} as Metric;
			lineMap.set(lineId, lineDoc);
		}

		// Aggregate monthly data into years
		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const yearKey = monthKey.slice(0, 4); // Extract YYYY from YYYY-MM

			// Initialize year if not exists
			if (!lineDoc.data[yearKey]) {
				lineDoc.data[yearKey] = { qty: 0 };
			}

			// Sum monthly quantity into yearly total
			lineDoc.data[yearKey].qty += monthData.qty;
		}
	}

	const results = Array.from(lineMap.values());

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
