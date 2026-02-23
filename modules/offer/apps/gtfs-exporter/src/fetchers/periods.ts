/* * */

import { periods } from '@tmlmobilidade/interfaces';
import { Period } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all periods and returns them as a Map keyed by ID
 * @returns A Map of period ID to Period object
 */
export async function fetchAllPeriods(): Promise<Map<string, Period>> {
	try {
		const allPeriods = await periods.findMany({});
		const periodsMap = new Map<string, Period>();
		for (const period of allPeriods) {
			periodsMap.set(period._id, period);
		}
		return periodsMap;
	}
	catch (error) {
		throw new Error(`Error fetching periods: ${error}`);
	}
}
