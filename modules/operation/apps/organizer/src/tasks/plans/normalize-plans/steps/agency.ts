/* * */

import { type GtfsStrictV30Agency, GtfsStrictV30AgencySchema } from '@tmlmobilidade/go-types-gtfs-strict';
import { Logger } from '@tmlmobilidade/logger';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type NormalizePlansTaskContext } from '../context/init-context.js';

/**
 * Builds the contents of the agency.txt file from the given Agency document.
 */
export function updateAgencyTxtContents(context: NormalizePlansTaskContext) {
	//

	//
	// Build and validate the agency row.

	const agencyRow: GtfsStrictV30Agency = {
		agency_email: context.data.agency.open_data?.details?.email,
		agency_fare_url: context.data.agency.open_data?.details?.fare_url,
		agency_id: context.data.agency.code,
		agency_lang: context.data.agency.primary_language,
		agency_name: context.data.agency.name,
		agency_phone: context.data.agency.open_data?.details?.phone,
		agency_timezone: context.data.agency.timezone,
		agency_url: context.data.agency.open_data?.details?.website_url,
	};

	const validatedAgencyRow = GtfsStrictV30AgencySchema.parse(agencyRow);

	const newAgencyTxtString = csvStringify([validatedAgencyRow], { header: true });

	//
	// Write the new agency.txt file to the extracted directory

	fs.writeFileSync(path.join(context.paths.extracted_dir_path, 'agency.txt'), newAgencyTxtString);

	Logger.info({ message: `[${context.data.plan._id}] agency.txt file updated.` });

	//
}
