/* * */

import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { ExtractionTaskContext, ExtractionTaskResult, OfferGtfsV29Extraction, OfferGtfsV29ExtractionPropertiesSchema, OfferGtfsV29ExtractionVersionValue } from '@tmlmobilidade/go-types-extractions';
import { filterPermissionResourceValues } from '@tmlmobilidade/go-types-permissions';
import { CsvWriter } from '@tmlmobilidade/writers';
import fs from 'node:fs';

import { exportGtfsV29 } from './main.js';

/**
 * Exports a GTFS feed.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function extractOfferGtfsV1(context: ExtractionTaskContext, extraction: OfferGtfsV29Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = OfferGtfsV29ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	validatedProperties.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: 'lines',
		values: validatedProperties.agency_ids,
	});

	//
	// Setup a temporary directory and a batch writer

	const temporaryDirectory = fs.mkdtempDisposableSync(`${OfferGtfsV29ExtractionVersionValue}-`);

	await exportGtfsV29({
		_id: extraction._id,
		progress_current: 0,
		progress_total: 0,
		workdir: temporaryDirectory.path,
	}, {
		agency_ids: validatedProperties.agency_ids,
		calendars_clip_end_date: validatedProperties.calendars_clip_end_date,
		calendars_clip_start_date: validatedProperties.calendars_clip_start_date,
		clip_calendars: true,
		feed_end_date: validatedProperties.feed_end_date,
		feed_start_date: validatedProperties.feed_start_date,
		lines_exclude: validatedProperties.lines_exclude,
		lines_include: validatedProperties.lines_include,
		numeric_calendar_codes: validatedProperties.numeric_calendar_codes,
		stop_sequence_start: validatedProperties.stop_sequence_start,
		stops_export_all: validatedProperties.stops_export_all,
		version: new Date().toISOString().replace(/[-:T]/g, '').slice(0, 13),
		workdir: temporaryDirectory.path,
		writers: {
			afetacao: new CsvWriter('afetacao.csv', `${temporaryDirectory.path}/afetacao.csv`),
			agency: new CsvWriter('agency.txt', `${temporaryDirectory.path}/agency.txt`),
			calendar_dates: new CsvWriter('calendar_dates.txt', `${temporaryDirectory.path}/calendar_dates.txt`),
			fare_attributes: new CsvWriter('fare_attributes.txt', `${temporaryDirectory.path}/fare_attributes.txt`),
			fare_rules: new CsvWriter('fare_rules.txt', `${temporaryDirectory.path}/fare_rules.txt`),
			feed_info: new CsvWriter('feed_info.txt', `${temporaryDirectory.path}/feed_info.txt`),
			routes: new CsvWriter('routes.txt', `${temporaryDirectory.path}/routes.txt`),
			shapes: new CsvWriter('shapes.txt', `${temporaryDirectory.path}/shapes.txt`),
			stop_times: new CsvWriter('stop_times.txt', `${temporaryDirectory.path}/stop_times.txt`),
			stops: new CsvWriter('stops.txt', `${temporaryDirectory.path}/stops.txt`),
			trips: new CsvWriter('trips.txt', `${temporaryDirectory.path}/trips.txt`),
		},
	});

	//
	// Export the stops to a CSV file

	return;
}
