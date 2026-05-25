/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { locations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedMunicipalitiesRow {
	district_id: string
	district_name: string
	municipality_id: string
	municipality_name: string
}

/**
 * Export the municipalities.txt file.
 * @param context The export context.
 */
export async function exportMunicipalitiesFile(context: ExportGtfsContext) {
	//

	//
	// Get all the municipalities matching the specified IDs.
	// These IDs are hardcoded, for now, to match only amL municipalities.

	const allAmlMunicipalities = await locations.findMunicipalities({
		_id: {
			$in: [
				'1502', '1503', '1115', '1504',
				'1105', '1106', '1107', '1109',
				'1506', '1507', '1116', '1110',
				'1508', '1510', '1511', '1512',
				'1111', '1114', '0712', '1101',
				'1102', '1113', '1112',
			],
		},
	});

	//
	// Add each municipality to the municipalities.txt file.

	for (const municipalityData of allAmlMunicipalities) {
		// Fetch the corresponding district data
		const districtData = await locations.findDistrictById(municipalityData.district_id);
		// Prepare the exported row
		const parsedMunicipalitiesRow: ExportedMunicipalitiesRow = {
			district_id: municipalityData.district_id,
			district_name: districtData?.name ?? '-',
			municipality_id: municipalityData._id,
			municipality_name: municipalityData.name,
		};
		// Write the row to the municipalities.txt file
		await context.writers.municipalities.write(parsedMunicipalitiesRow);
	}

	await context.writers.municipalities.flush();

	Logger.info('Exported municipalities.txt file.');
}
