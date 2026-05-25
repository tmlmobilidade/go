/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { agencies } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';

/* * */

export interface ExportedAgencyRow {
	agency_id: string
	agency_name: string
	agency_email: string
	agency_phone: string
	agency_url: string
	agency_fare_url: string
	agency_lang: string
	agency_timezone: string
	cemv_support: 0 | 1 | 2
}

/**
 * Export the agency.txt file.
 * @param agencyIds The list of agency IDs to export.
 * @param context The export context.
 */
export async function exportAgencyFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	//
	// Get agencies data from the database.

	const foundAgenciesData = await agencies.findMany(
		{ _id: { $in: agencyIds } },
		{ sort: { _id: 1 } },
	);

	for (const agencyData of foundAgenciesData) {
		const parsedAgencyRow: ExportedAgencyRow = {
			agency_id: agencyData._id,
			agency_name: agencyData.name,
			agency_email: agencyData.public_email,
			agency_phone: agencyData.phone,
			agency_url: agencyData.website_url,
			agency_fare_url: agencyData.fare_url,
			agency_lang: 'pt',
			agency_timezone: agencyData.timezone,
			cemv_support: 0,
		};
		await context.writers.agency.write(parsedAgencyRow);
	}

	await context.writers.agency.flush();

	Logger.info('Exported agency.txt file.');
}
