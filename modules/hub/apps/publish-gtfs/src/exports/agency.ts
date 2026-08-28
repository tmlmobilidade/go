/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { HubGtfsExportAgency, HubGtfsExportAgencySchema } from '@tmlmobilidade/go-types-hub';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/**
 * Export the agency.txt file.
 * @param agencyIds The list of agency IDs to export.
 * @param context The export context.
 */
export async function exportAgencyFile(agencyIds: string[], context: ExportGtfsContext) {
	//

	const timer = new Timer();

	Logger.info({ message: 'Exporting agency.txt file...' });

	//
	// Get agencies data from the database.

	const foundAgenciesData = await goDb.core.agencies.findMany({ _id: { $in: agencyIds } });

	for (const agencyData of foundAgenciesData) {
		const parsedAgencyRow: HubGtfsExportAgency = {
			agency_code: agencyData.code,
			agency_email: agencyData.public_email,
			agency_fare_url: agencyData.fare_url,
			agency_id: agencyData._id,
			agency_lang: agencyData.primary_language ?? 'pt',
			agency_name: agencyData.public_name || agencyData.name,
			agency_phone: agencyData.phone,
			agency_timezone: agencyData.timezone,
			agency_url: agencyData.website_url,
			cemv_support: '0',
		};
		const validatedAgencyRow = HubGtfsExportAgencySchema.parse(parsedAgencyRow);
		await context.writers.agency.write(validatedAgencyRow);
	}

	await context.writers.agency.flush();

	Logger.success(`Exported agency.txt file in ${timer.get()}.`);
}
