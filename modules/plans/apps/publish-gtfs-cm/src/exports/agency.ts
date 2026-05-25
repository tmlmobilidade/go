/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { agencies } from '@tmlmobilidade/interfaces';
import { Logger } from '@tmlmobilidade/logger';
import { type Agency } from '@tmlmobilidade/types';

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

const CM_EXTERNAL_AGENCY_ROWS: Record<string, ExportedAgencyRow> = {
	41: {
		agency_id: '41',
		agency_name: 'Viação Alvorada',
		agency_email: 'contacto@carrismetropolitana.pt',
		agency_phone: '+351210410400',
		agency_url: 'https://carrismetropolitana.pt',
		agency_fare_url: 'https://carrismetropolitana.pt/tarifarios',
		agency_lang: 'pt',
		agency_timezone: 'Europe/Lisbon',
		cemv_support: 0,
	},
	42: {
		agency_id: '42',
		agency_name: 'Rodoviária de Lisboa',
		agency_email: 'contacto@carrismetropolitana.pt',
		agency_phone: '+351210410400',
		agency_url: 'https://carrismetropolitana.pt',
		agency_fare_url: 'https://carrismetropolitana.pt/tarifarios',
		agency_lang: 'pt',
		agency_timezone: 'Europe/Lisbon',
		cemv_support: 0,
	},
	43: {
		agency_id: '43',
		agency_name: 'Transportes Sul do Tejo',
		agency_email: 'contacto@carrismetropolitana.pt',
		agency_phone: '+351210410400',
		agency_url: 'https://carrismetropolitana.pt',
		agency_fare_url: 'https://carrismetropolitana.pt/tarifarios',
		agency_lang: 'pt',
		agency_timezone: 'Europe/Lisbon',
		cemv_support: 0,
	},
	44: {
		agency_id: '44',
		agency_name: 'Alsa Todi',
		agency_email: 'contacto@carrismetropolitana.pt',
		agency_phone: '+351210410400',
		agency_url: 'https://carrismetropolitana.pt',
		agency_fare_url: 'https://carrismetropolitana.pt/tarifarios',
		agency_lang: 'pt',
		agency_timezone: 'Europe/Lisbon',
		cemv_support: 0,
	},
};

function parseAgencyRow(agencyData: Agency): ExportedAgencyRow {
	return CM_EXTERNAL_AGENCY_ROWS[agencyData._id] ?? {
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
}

/**
 * Export the agency.txt file.
 * @param agencyIds The list of agency IDs to export.
 * @param exportConfig The export configuration.
 */
export async function exportAgencyFile(agencyIds: string[], exportConfig: MergedGtfsExportConfig) {
	//

	//
	// Get agencies data from the database.

	const foundAgenciesData = await agencies.findMany(
		{ _id: { $in: agencyIds } },
		{ sort: { _id: 1 } },
	);

	for (const agencyData of foundAgenciesData) {
		await exportConfig.writers.agency.write(parseAgencyRow(agencyData));
	}

	await exportConfig.writers.agency.flush();

	Logger.info('Exported agency.txt file.');
}
