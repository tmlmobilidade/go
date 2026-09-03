/* * */

import { type Agency } from '@tmlmobilidade/go-types-core';
import { type GtfsStrictV30Agency } from '@tmlmobilidade/go-types-gtfs-strict';
import Papa from 'papaparse';

/**
 * Builds the contents of the agency.txt file from the given Agency document.
 */
export function buildAgencyTxt(agencyData: Agency): string {
	//

	const contacts = agencyData.open_data?.contacts;

	if (!contacts) throw new Error(`Agency "${agencyData._id}" has no open_data.contacts.`);

	const agencyRow: GtfsStrictV30Agency = {
		agency_email: contacts.email,
		agency_fare_url: contacts.fare_url,
		agency_id: agencyData._id,
		agency_lang: agencyData.primary_language,
		agency_name: agencyData.name,
		agency_phone: contacts.phone,
		agency_timezone: agencyData.timezone,
		agency_url: contacts.website_url,
	};

	return Papa.unparse([agencyRow]);

	//
}
