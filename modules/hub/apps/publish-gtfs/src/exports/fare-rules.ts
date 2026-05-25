/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedFareRulesRow {
	fare_id: string
	route_id: string
}

interface FareRuleObjApiResponse {
	fare_id: string
	route_id: string
}

/**
 * Export the fare_attributes.txt file.
 * @param context The export context.
 */
export async function exportFareRulesFile(routeIds: string[], context: ExportGtfsContext) {
	//

	//
	// Fetch dates from GO v1 API

	const allFareRulesRes = await fetch('https://go.carrismetropolitana.pt/api/fares/public/rules');
	const allFareRulesData = await allFareRulesRes.json() as FareRuleObjApiResponse[];

	//
	// Parse and write dates

	for (const fareRuleData of allFareRulesData) {
		// Skip fare rules that are not related to the exported routes
		if (!routeIds.includes(fareRuleData.route_id)) continue;
		// Parse data row
		const parsedFareRulesRow: ExportedFareRulesRow = {
			// WORKAROUND: Prefix fare_id with '4' and first
			// character of route_id to avoid fare_id collisions between agencies.
			fare_id: `4${fareRuleData.route_id.substring(0, 1)}-${fareRuleData.fare_id}`,
			route_id: fareRuleData.route_id,
		};
		// Write data row
		await context.writers.fare_rules.write(parsedFareRulesRow);
	}

	await context.writers.fare_rules.flush();

	Logger.info('Exported fare_rules.txt file.');
}
