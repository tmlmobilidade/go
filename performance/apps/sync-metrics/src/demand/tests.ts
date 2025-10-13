import LOGGER from '@helperkits/logger';
import { metrics } from '@tmlmobilidade/interfaces';

/**
 * Test function to validate that demand metrics match across different aggregations.
 * It compares:
 *   - Yearly metrics
 *   - Monthly metrics
 *   - Daily metrics
 *
 * ⚠️ Disclaimer:
 *   For the current year, totals may not match perfectly because:
 *     1. Validations are continuously coming in.
 *     2. Yearly, monthly, and daily calculations take some time to complete.
 *   Therefore, small differences for the ongoing year are expected and not necessarily an error.
 */
export const testDemandMetrics = async () => {
	//

	const YEAR = 2024;

	const metricsCollection = await metrics.getCollection();

	//
	// Fetch metrics

	const yearlyMetrics = await metricsCollection.find({
		metric: 'demand_by_line_by_year',
	}).toArray();

	const monthlyMetrics = await metricsCollection.find({
		metric: 'demand_by_line_by_month',
	}).toArray();

	const dailyMetrics = await metricsCollection.find({
		metric: 'demand_by_line_by_day',
	}).toArray();

	//
	// Sum of all yearly metrics for YEAR

	const totalYearly = yearlyMetrics.reduce((sum, yearly) => sum + (yearly.data?.[YEAR]?.qty ?? 0), 0);

	//
	// Sum of all monthly metrics for YEAR

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
	// Sum of all daily metrics for YEAR

	let totalDaily = 0;
	for (const daily of dailyMetrics) {
		if (daily.data) {
			for (const [day, value] of Object.entries(daily.data)) {
				if (day.startsWith(`${YEAR}-`)) {
					totalDaily += value.qty ?? 0;
				}
			}
		}
	}

	//
	// Print results

	LOGGER.divider('===== DEMAND METRICS CHECK =====');
	LOGGER.info(`Total Yearly (${YEAR}): ${totalYearly}`);
	LOGGER.info(`Total Monthly (${YEAR}): ${totalMonthly}`);
	LOGGER.info(`Total Daily (${YEAR}):   ${totalDaily}`);
	LOGGER.divider('---------------------------------');
	LOGGER.info(`Difference Yearly vs Monthly: ${totalYearly - totalMonthly}`);
	LOGGER.info(`Difference Yearly vs Daily:   ${totalYearly - totalDaily}`);
	LOGGER.divider('=================================');

	if (totalYearly === totalMonthly && totalYearly === totalDaily) {
		LOGGER.info('✅ SUCCESS: All metrics match perfectly for 2024!');
	}
	else {
		LOGGER.error('⚠️ WARNING: There are mismatches between yearly, monthly, and daily totals.');
	}

	LOGGER.terminate('Demand metrics test completed.');
};
