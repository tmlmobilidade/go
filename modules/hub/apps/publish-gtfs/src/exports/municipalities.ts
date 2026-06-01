/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { locations } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

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

	const timer = new Timer();

	Logger.info('Exporting municipalities.txt file...');

	//
	// Get all the municipalities data

	const allAmlMunicipalities = await locations.findMunicipalities({}, { projection: { _id: 1, district_id: 1, name: 1 } });

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

	Logger.success(`Exported municipalities.txt file in ${timer.get()}.`);
}
