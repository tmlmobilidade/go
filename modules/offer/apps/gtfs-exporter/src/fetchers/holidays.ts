/* * */

import { holidays } from '@tmlmobilidade/interfaces';
import { Holiday } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all holidays for a given agency and returns them as a Map keyed by ID
 * @param agencyId - The agency ID to fetch holidays for
 * @returns A Map of holiday ID to Holiday object
 */
export async function fetchAllHolidays(agencyId: string): Promise<Map<string, Holiday>> {
	try {
		const allHolidays = await holidays.findByAgencyIds([agencyId]);
		const holidaysMap = new Map<string, Holiday>();
		for (const holiday of allHolidays) {
			holidaysMap.set(holiday._id, holiday);
		}
		return holidaysMap;
	} catch (error) {
		throw new Error(`Error fetching holidays: ${error}`);
	}
}
