/* * */

import { zones } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Zone } from '@tmlmobilidade/types';

/* * */

/**
 * Fetches all zones and returns them as a Map indexed by zone ID
 * This allows for efficient lookups when processing patterns
 * @returns Map of zone ID to Zone object
 */
export async function fetchAllZones(): Promise<Map<string, Zone>> {
	try {
		Logger.info({ message: 'Fetching all zones...' });

		const allZones = await zones.findMany({});
		const zonesMap = new Map<string, Zone>();

		for (const zone of allZones) {
			zonesMap.set(zone._id, zone);
		}

		Logger.success(`Loaded ${zonesMap.size} zones into memory`);
		return zonesMap;
	} catch (error) {
		Logger.error({ error, message: 'Error fetching zones' });
		throw new Error(`Failed to fetch zones: ${error}`);
	}
}
