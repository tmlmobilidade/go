/* * */

import { computeSupplyDerivedFields } from '@/utils/supply-derived.js';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric, SupplyByPatternByMonth } from '@tmlmobilidade/types';

/* * */

type SupplyTotals = {
	accomplished_rides: number
	cost: number
	cost_per_pax: number
	passengers_observed: number
	net_result: number
	revenue: number
	revenue_per_pax: number
	scheduled_rides: number
	vkms_observed: number
	vkms_scheduled: number
};

const emptyTotals = (): SupplyTotals => ({
	accomplished_rides: 0,
	cost: 0,
	cost_per_pax: 0,
	passengers_observed: 0,
	net_result: 0,
	revenue: 0,
	revenue_per_pax: 0,
	scheduled_rides: 0,
	vkms_observed: 0,
	vkms_scheduled: 0,
});

/* * */

export const syncSupplyByPatternByYear = async () => {
	//

	Logger.title(`Sync Supply Metrics by Pattern by Year`);
	const globalTimer = new Timer();

	const METRIC = 'supply_by_pattern_by_year';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	// Fetch by_month metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const monthlyMetrics = await metricsCollection
		.find({ metric: 'supply_by_pattern_by_month' })
		.toArray() as SupplyByPatternByMonth[];

	Logger.info({ message: `Fetched ${monthlyMetrics.length} monthly metrics (${fetchTimer.get()})` });

	// Process monthly metrics into yearly aggregates

	const patternMap = new Map<string, Metric>();

	for (const monthlyMetric of monthlyMetrics) {
		const pattern_id = monthlyMetric.properties.pattern_id;

		// Initialize pattern if not exists
		if (!patternMap.has(pattern_id)) {
			patternMap.set(pattern_id, {
				data: {} as Record<string, SupplyTotals>,
				description: `Aggregated supply for pattern ${pattern_id}`,
				generated_at: new Date(),
				metric: METRIC,
				properties: { pattern_id },
			} as Metric);
		}

		const patternDoc = patternMap.get(pattern_id);

		// Aggregate monthly data into years
		for (const [monthKey, monthData] of Object.entries(monthlyMetric.data)) {
			const yearKey = monthKey.slice(0, 4); // YYYY

			// Initialize year if not exists
			if (!patternDoc.data[yearKey]) {
				patternDoc.data[yearKey] = emptyTotals();
			}

			const yearData = patternDoc.data[yearKey] as SupplyTotals;

			// Sum monthly totals into yearly total
			yearData.scheduled_rides += Number(monthData.scheduled_rides ?? 0);
			yearData.accomplished_rides += Number(monthData.accomplished_rides ?? 0);
			yearData.vkms_observed += Number(monthData.vkms_observed ?? 0);
			yearData.vkms_scheduled += Number(monthData.vkms_scheduled ?? 0);
			yearData.revenue += Number(monthData.revenue ?? 0);
			yearData.cost += Number(monthData.cost ?? 0);
			yearData.passengers_observed += Number(monthData.passengers_observed ?? 0);

			const derived = computeSupplyDerivedFields(yearData.cost, yearData.revenue, yearData.passengers_observed);
			yearData.net_result = derived.net_result;
			yearData.cost_per_pax = derived.cost_per_pax;
			yearData.revenue_per_pax = derived.revenue_per_pax;
		}
	}

	const results = Array.from(patternMap.values());

	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} yearly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_month metrics', key: 'aggregate_from_monthly' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
