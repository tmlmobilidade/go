/* * */

import { metrics } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import TIMETRACKER from '@helperkits/timer';

const metricTypes = [
	{ hasDaily: true, id: 'demand_by_line' },
	{ hasDaily: true, id: 'demand_by_agency' },
	{ hasDaily: true, id: 'demand_by_pattern' },
	{ hasDaily: false, id: 'demand_by_pattern_hour' },
];

type Metrics = 'demand_by_agency' | 'demand_by_line' | 'demand_by_pattern' | 'demand_by_pattern_hour';
type YearlyMetricType = `${Metrics}_by_year`;
type MonthlyMetricType = `${Metrics}_by_month`;

type DailyMetrics = Exclude<Metrics, 'demand_by_pattern_hour'>;
type DailyMetricType = `${DailyMetrics}_by_day`;

interface DemandMetricResult {
	daily: number
	hasDaily: boolean
	monthly: number
	yearly: number
}

/**
 * Test function to validate that demand metrics match across different aggregations.
 * It compares:
 *   - Yearly metrics
 *   - Monthly metrics
 *   - Daily metrics
 *
 * ⚠️ Disclaimers:
 * 1. For the current year, totals (monthly, yearly, or daily) may differ slightly because:
 *    - Validations are continuously ingested.
 *    - Aggregations for different periods may run at different times.
 *
 * 2. The metric `demand_by_pattern_hour` is calculated from the **rides** collection,
 *    which contains only **planned rides**, whereas `demand_by_line` and `demand_by_pattern`
 *    use the **validations** collection, which includes both **planned and unplanned rides**.
 *
 *    ➤ Therefore, values from `demand_by_pattern_hour` are **not directly comparable**
 *      to those from `demand_by_line` or `demand_by_pattern`.
 */
export const testDemandMetrics = async () => {
	//

	Logger.title('Demand Metrics Comparison Test');
	const globalTimer = new TIMETRACKER();

	const YEAR = 2024;
	const metricsCollection = await metrics.getCollection();

	const results: Record<string, DemandMetricResult> = {};

	//
	// Test each metric type

	for (const metricType of metricTypes) {
		//

		const metricTimer = new TIMETRACKER();

		//
		// Fetch metrics for all time ranges

		const yearlyMetrics = await metricsCollection.find({
			metric: `${metricType.id}_by_year` as YearlyMetricType,
		}).toArray();

		const monthlyMetrics = await metricsCollection.find({
			metric: `${metricType.id}_by_month` as MonthlyMetricType,
		}).toArray();

		const dailyMetrics = await metricsCollection.find({
			metric: `${metricType.id}_by_day` as DailyMetricType,
		}).toArray();

		//
		// Calculate yearly totals

		const totalYearly = yearlyMetrics.reduce(
			(sum, yearly) => sum + (yearly.data?.[YEAR]?.qty ?? 0),
			0,
		);

		//
		// Calculate monthly totals

		let totalMonthly = 0;
		for (const monthly of monthlyMetrics) {
			if (monthly.data) {
				for (const [month, value] of Object.entries(monthly.data)) {
					if (month.startsWith(`${YEAR}-`)) {
						totalMonthly += value.qty ?? 0;
					}
				}
			}
		}

		//
		// Calculate daily totals if applicable

		let totalDaily = 0;
		if (metricType.hasDaily) {
			for (const daily of dailyMetrics) {
				if (daily.data) {
					for (const [day, value] of Object.entries(daily.data)) {
						if (day.startsWith(`${YEAR}-`)) {
							totalDaily += (value as { qty?: number }).qty ?? 0;
						}
					}
				}
			}
		}

		//
		// Store results for cross-metric comparison

		results[metricType.id] = {
			daily: totalDaily,
			hasDaily: metricType.hasDaily,
			monthly: totalMonthly,
			yearly: totalYearly,
		};

		//
		// Log results for this metric type

		Logger.divider(`----- ${metricType.id.toUpperCase()} -----`);
		Logger.info(`Year total:  ${totalYearly.toLocaleString()}`);
		Logger.info(`Month total: ${totalMonthly.toLocaleString()}`);
		Logger.info(
			`Day total:   ${
				metricType.hasDaily ? totalDaily.toLocaleString() : 'N/A (no daily metrics)'
			}`,
		);

		const matchResult = metricType.hasDaily
			? totalYearly === totalMonthly && totalYearly === totalDaily
				? '✅ All time periods match!'
				: '⚠️ Mismatches between time periods'
			: totalYearly === totalMonthly
				? '✅ Year and month match!'
				: '⚠️ Year and month do not match';

		Logger.info(matchResult);
		Logger.info(`Processed in ${metricTimer.get()}`);
	}

	Logger.divider('===== CROSS-METRIC COMPARISON =====');

	const lineResults = results['demand_by_line'];
	const agencyResults = results['demand_by_agency'];
	const patternResults = results['demand_by_pattern'];
	const hourResults = results['demand_by_pattern_hour'];

	if (lineResults && patternResults && agencyResults) {
		Logger.info(`Line yearly total:   ${lineResults.yearly.toLocaleString()}`);
		Logger.info(`Pattern yearly total: ${patternResults.yearly.toLocaleString()}`);
		Logger.info(`Agency yearly total:  ${agencyResults.yearly.toLocaleString()}`);

		if (lineResults.yearly === patternResults.yearly && lineResults.yearly === agencyResults.yearly) {
			Logger.info('✅ Line, pattern, and agency yearly totals match!');
		}
		else {
			Logger.info('⚠️ Line, pattern, and agency yearly totals do not match');
		}
	}

	if (hourResults && patternResults) {
		Logger.divider('Note: Pattern-hour metrics use the rides collection (planned rides only)');
		Logger.info(`Pattern yearly total:      ${patternResults.yearly.toLocaleString()}`);
		Logger.info(`Pattern-hour yearly total: ${hourResults.yearly.toLocaleString()}`);
		Logger.info(`Difference: ${(patternResults.yearly - hourResults.yearly).toLocaleString()}`);
		Logger.info(
			'⚠️ Disclaimer: These totals are **not expected to match** because the rides collection excludes unplanned rides.',
		);
	}

	Logger.terminate(`Demand metrics test completed in ${globalTimer.get()}`);
};
