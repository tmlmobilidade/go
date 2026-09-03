/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { type GtfsStrictV30Agency, GtfsStrictV30AgencySchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { stringify as csvStringify } from 'csv-stringify/sync';

/**
 * Builds the contents of the agency.txt file from the given Agency document.
 */
export async function buildAgencyTxt(planData: Plan): Promise<string> {
	//

	//
	// Fetch the agency data from the database.

	const agencyData = await goDb.core.agencies.findById(planData.agency_id);

	if (!agencyData) {
		throw new Error(`Plan "${planData._id}" has no agency.`);
	}

	//
	// Build and validate the agency row.

	const agencyRow: GtfsStrictV30Agency = {
		agency_email: agencyData.open_data?.contacts?.email,
		agency_fare_url: agencyData.open_data?.contacts?.fare_url,
		agency_id: agencyData._id,
		agency_lang: agencyData.primary_language,
		agency_name: agencyData.name,
		agency_phone: agencyData.open_data?.contacts?.phone,
		agency_timezone: agencyData.timezone,
		agency_url: agencyData.open_data?.contacts?.website_url,
	};

	const validatedAgencyRow = GtfsStrictV30AgencySchema.parse(agencyRow);

	return csvStringify([validatedAgencyRow], { header: true });

	//
}
