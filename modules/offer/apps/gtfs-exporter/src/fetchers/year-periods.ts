/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { YearPeriod } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all year periods and returns them as a Map keyed by ID
 * @returns A Map of period ID to YearPeriod object
 */
export async function fetchAllYearPeriods(): Promise<Map<string, YearPeriod>> {
	try {
		const allPeriods = await goDb.offer.yearPeriods.findMany({});
		const periodsMap = new Map<string, YearPeriod>();
		for (const period of allPeriods) {
			periodsMap.set(period._id, period);
		}
		return periodsMap;
	} catch (error) {
		throw new Error(`Error fetching periods: ${error}`);
	}
}
