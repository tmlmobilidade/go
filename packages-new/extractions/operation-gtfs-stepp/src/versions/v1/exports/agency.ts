/* * */

import { GtfsStrictV30SteppAgencySchema } from '@tmlmobilidade/go-types-gtfs-strict';

import { readById } from '../fetchers/csv.js';
import { type PlanExportConfig } from '../types.js';
import { mergeSharedRow } from '../utils/merge.js';
import { pick } from '../utils/rows.js';

/* * */

/** Prepare agency definitions from one normalized plan. */
export async function exportAgencyFile(config: PlanExportConfig) {
	const agencies = await readById(config, 'agency', 'agency_id');
	const sourceAgency = agencies.get(config.agencyCode);
	if (!sourceAgency) throw new Error(`Plan "${config.planId}" has no agency "${config.agencyCode}" in agency.txt`);
	const agency = pick(sourceAgency, ['agency_id', 'agency_name', 'agency_url', 'agency_timezone', 'agency_lang', 'agency_phone', 'agency_fare_url', 'agency_email']);
	agency.agency_timezone ||= 'Europe/Lisbon';
	agency.agency_lang ||= 'pt';
	GtfsStrictV30SteppAgencySchema.parse({ ...agency, agency_url: agency.agency_url || undefined });
	mergeSharedRow(config, 'agency', config.agencyCode, agency);
}
