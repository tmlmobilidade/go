/* * */
/* eslint-disable perfectionist/sort-objects */

import type { Agency, GtfsTMLAgency } from '@tmlmobilidade/types';

import { type GtfsV29ExportConfig } from '@/types.js';

/* * */

/**
 * Parses agency data into GTFS agency.txt format
 * @param agencyData - The agency data from the database
 * @returns The formatted agency row
 */
export function parseAgency(agencyData: Agency): GtfsTMLAgency {
	try {
		return {
			agency_email: agencyData.public_email || '',
			agency_fare_url: agencyData.fare_url || '',
			agency_id: agencyData.code,
			agency_lang: 'pt',
			agency_name: agencyData.name, // 'Carris Metropolitana',
			agency_url: agencyData.website_url, // 'https://www.carrismetropolitana.pt',
			agency_timezone: agencyData.timezone || 'Europe/Lisbon',
			agency_phone: agencyData.phone, // '210410400',
		};
	} catch (error) {
		throw new Error(`Error parsing agency: ${error}`);
	}
}

/**
 * Exports the agency.txt file
 * @param agencyData - The agency data
 * @param exportConfig - The export configuration
 */
export async function exportAgencyFile(
	agencyData: Agency,
	exportConfig: GtfsV29ExportConfig,
) {
	const parsedAgency = parseAgency(agencyData);
	await exportConfig.writers.agency.write(parsedAgency);
	await exportConfig.writers.agency.flush();
}
