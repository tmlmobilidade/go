import { type MergedGtfsExportConfig } from '@/types.js';
import { Logger } from '@tmlmobilidade/logger';

/* * */

interface ExportedDatesRow {
	fare_id: string
	route_id: string
}

interface FareRuleObjApiResponse {
	fare_id: string
	route_id: string
}

/**
 * Export the fare_attributes.txt file.
 * @param exportConfig The export configuration.
 */
export async function exportFareRulesFile(routeIds: string[], exportConfig: MergedGtfsExportConfig) {
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
		const parsedFareRulesRow: ExportedDatesRow = {
			fare_id: fareRuleData.fare_id,
			route_id: fareRuleData.route_id,
		};
		// Write data row
		await exportConfig.writers.fare_rules.write(parsedFareRulesRow);
	}

	await exportConfig.writers.fare_rules.flush();

	Logger.info('Exported fare_rules.txt file.');
}
