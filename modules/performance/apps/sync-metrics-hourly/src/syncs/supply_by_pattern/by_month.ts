/* * */

import { computeSupplyDerivedFields } from '@/utils/supply-derived.js';
import { logMetricToFile } from '@tmlmobilidade/go-performance-pckg-log';
import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { Metric, SupplyByPatternByDay } from '@tmlmobilidade/types';

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

export const syncSupplyByPatternByMonth = async () => {
	Logger.title(`Sync Supply Metrics by Pattern by Month`);
	const globalTimer = new Timer();

	const METRIC = 'supply_by_pattern_by_month';

	//
	// Delete existing metrics

	const deleteTimer = new Timer();
	await metrics.deleteMany({ metric: METRIC });
	Logger.info({ message: `Cleared existing metrics in ${deleteTimer.get()}` });

	// Fetch by_day metrics from the metrics collection

	const fetchTimer = new Timer();

	const metricsCollection = await metrics.getCollection();
	const dailyMetrics = await metricsCollection
		.find({ metric: 'supply_by_pattern_by_day' })
		.toArray() as SupplyByPatternByDay[];

	Logger.info({ message: `Fetched ${dailyMetrics.length} daily metrics (${fetchTimer.get()})` });

	//
	// Process daily metrics into monthly aggregates

	const patternMap = new Map<string, Metric>();

	for (const dailyMetric of dailyMetrics) {
		const pattern_id = dailyMetric.properties.pattern_id;

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

		// Aggregate daily data into months
		for (const [dayKey, dayData] of Object.entries(dailyMetric.data)) {
			const monthKey = dayKey.slice(0, 7); // YYYY-MM

			// Initialize month if not exists
			if (!patternDoc.data[monthKey]) {
				patternDoc.data[monthKey] = emptyTotals();
			}

			const monthData = patternDoc.data[monthKey] as SupplyTotals;

			// Sum daily totals into monthly total
			monthData.scheduled_rides += Number(dayData.scheduled_rides ?? 0);
			monthData.accomplished_rides += Number(dayData.accomplished_rides ?? 0);
			monthData.vkms_observed += Number(dayData.vkms_observed ?? 0);
			monthData.vkms_scheduled += Number(dayData.vkms_scheduled ?? 0);
			monthData.revenue += Number(dayData.revenue ?? 0);
			monthData.cost += Number(dayData.cost ?? 0);
			monthData.passengers_observed += Number(dayData.passengers_observed ?? 0);

			const derived = computeSupplyDerivedFields(monthData.cost, monthData.revenue, monthData.passengers_observed);
			monthData.net_result = derived.net_result;
			monthData.cost_per_pax = derived.cost_per_pax;
			monthData.revenue_per_pax = derived.revenue_per_pax;
		}
	}

	const results = Array.from(patternMap.values());

	//
	// Insert all metrics

	const insertTimer = new Timer();
	await metrics.insertMany(results);
	Logger.info({ message: `Inserted ${results.length} monthly metrics (${insertTimer.get()})` });

	logMetricToFile({
		approach: { description: 'Aggregate from by_day metrics', key: 'aggregate_from_daily' },
		metric: METRIC,
		queryCount: 1,
		runtime: globalTimer.get(),
		timestamp: new Date().toISOString(),
	});

	Logger.terminate(`Processed ${results.length} results (${globalTimer.get()})`);
};

//
