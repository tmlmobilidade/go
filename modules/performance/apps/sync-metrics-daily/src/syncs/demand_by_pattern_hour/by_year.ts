/* * */

import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { DemandByPatternHourByMonth, Metric } from '@tmlmobilidade/types';

/* * */

export const syncDemandByPatternHourByYear = async () => {
	//

	Logger.title(`Sync Demand Metrics by Pattern Hour by Year`);
	const globalTimer = new Timer();

	const METRIC = 'demand_by_pattern_hour_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	Logger.info({ message: `Clearing existing '${METRIC}' metrics...` });
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	//
	// Fetch metrics collection

	const metricsCollection = await metrics.getCollection();

	//
	// Get all monthly metrics

	const cascadeTimer = new Timer();
	Logger.info({ message: `Aggregating from demand_by_pattern_hour_by_month metrics...` });

	const monthlyMetrics = await metricsCollection
		.find({ metric: 'demand_by_pattern_hour_by_month' }, { allowDiskUse: false })
		.toArray() as DemandByPatternHourByMonth[];

	Logger.info({ message: `Found ${monthlyMetrics.length} monthly metrics to aggregate (${cascadeTimer.get()})` });

	//
	// Aggregate by pattern hour and sum by year

	const yearlyMap = new Map<string, Metric>();

	for (const monthlyMetric of monthlyMetrics) {
		const { hour, line_id, minute, pattern_id } = monthlyMetric.properties;

		// Group monthly data by year
		const yearlyData: Record<string, { qty: number }> = {};

		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const year = monthKey.split('-')[0]; // Extract year from "YYYY-MM"
			if (!yearlyData[year]) {
				yearlyData[year] = { qty: 0 };
			}
			yearlyData[year].qty += (monthData as { qty: number }).qty;
		}

		// Create or update yearly metric
		const key = `${pattern_id}_${hour}_${minute}`;
		if (!yearlyMap.has(key)) {
			yearlyMap.set(key, {
				data: yearlyData,
				description: `Aggregated passenger demand for pattern ${pattern_id} at ${hour}:${minute.toString().padStart(2, '0')}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: {
					hour,
					line_id,
					minute,
					pattern_id,
				},
			} as Metric);
		}
		else {
			// Merge yearly data if somehow we have duplicates
			const existingMetric = yearlyMap.get(key);
			for (const [year, data] of Object.entries(yearlyData)) {
				if (!existingMetric.data[year]) {
					existingMetric.data[year] = { qty: 0 };
				}
				existingMetric.data[year].qty += data.qty;
			}
		}
	}

	const monthlyAggregation = Array.from(yearlyMap.values());
	Logger.info({ message: `Aggregated ${monthlyAggregation.length} yearly metrics from monthly data (${cascadeTimer.get()})` });

	//
	// Insert all metrics

	if (monthlyAggregation.length > 0) {
		await metrics.insertMany(monthlyAggregation);
	}

	logMetricToFile({
		approach: { description: 'Cascade from monthly metrics (single query)', key: 'cascade_from_monthly' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${monthlyAggregation.length} results (${globalTimer.get()})`);
};

//
