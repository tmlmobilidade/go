/* * */

import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { ExtractionTaskContext, ExtractionTaskResult, OfferGtfsSteppV1Extraction, OfferGtfsSteppV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { CsvWriter } from '@tmlmobilidade/writers';

import { exportGtfsSteppV1 } from './main.js';

/**
 * Exports a GTFS feed.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function extractOfferGtfsSteppV1(context: ExtractionTaskContext, extraction: OfferGtfsSteppV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = OfferGtfsSteppV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const [permittedAgencyId] = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: 'lines',
		values: [validatedProperties.agency_id],
	});

	if (!permittedAgencyId) throw new Error(`User "${extraction.created_by}" has no permission to read lines of agency "${validatedProperties.agency_id}"`);

	//
	// Write the GTFS files to the output directory.
	// The extractions worker zips this directory and uploads it for download.

	await exportGtfsSteppV1({
		_id: extraction._id,
		progress_current: 0,
		progress_total: 0,
		workdir: context.output_path,
	}, {
		agency_id: permittedAgencyId,
		end_date: validatedProperties.end_date,
		start_date: validatedProperties.start_date,
		workdir: context.output_path,
		writers: {
			agency: new CsvWriter('agency.txt', `${context.output_path}/agency.txt`),
			calendar: new CsvWriter('calendar.txt', `${context.output_path}/calendar.txt`),
			calendar_dates: new CsvWriter('calendar_dates.txt', `${context.output_path}/calendar_dates.txt`),
			shapes: new CsvWriter('shapes.txt', `${context.output_path}/shapes.txt`),
			stops: new CsvWriter('stops.txt', `${context.output_path}/stops.txt`),
			trips: new CsvWriter('trips.txt', `${context.output_path}/trips.txt`),
		},
	});

	return;
}
