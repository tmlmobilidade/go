/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationPermissionMatch } from '@tmlmobilidade/go-interfaces-locationsdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureStopsV1Extraction, InfrastructureStopsV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Stop } from '@tmlmobilidade/go-types-infrastructure';
import { PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type InfrastructureStopsV1OutputRow, InfrastructureStopsV1OutputRowSchema } from './types.js';

/**
 * Exports a batch of stops to a CSV file.
 * @param fileExport - The file export object.
 * @returns The path to the exported file.
 */
export async function extractInfrastructureStopsV1(context: ExtractionTaskContext, extraction: InfrastructureStopsV1Extraction): Promise<ExtractionTaskResult> {
	//

	//
	// Validate the received properties

	const validatedProperties = InfrastructureStopsV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const locationAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: PermissionCatalog.all.stops.actions.read, scope: PermissionCatalog.all.stops.scope }],
		permissions: userPermissions,
		resource_key: 'location_ids',
	});

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<Stop> = [
		{
			$match: {
				...(locationAccess.allowAll ? {} : locationPermissionMatch(locationAccess.values)),
				'flags.agency_ids': { $in: validatedProperties.agency_ids ?? [] },
				'location.primary.osm_id': { $in: validatedProperties.location_primary_ids?.map(Number) ?? [] },
				'location.secondary.osm_id': { $in: validatedProperties.location_secondary_ids?.map(Number) ?? [] },
				'location.tertiary.osm_id': { $in: validatedProperties.location_tertiary_ids?.map(Number) ?? [] },
			},
		},
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.infrastructure.stops.aggregate(pipeline);

	//
	// Setup a temporary directory and a batch writer

	const temporaryDirectory = fs.mkdtempDisposableSync('infrastructure-stops-v1-');

	const writer = new BatchWriter({
		batch_size: 100_000,
		insertFn: async (data) => {
			const dirPath = path.join(temporaryDirectory.path, 'stops.csv');
			const fileAlreadyExists = fs.existsSync(dirPath);
			const csvData = csvStringify(data, { header: !fileAlreadyExists });
			fs.appendFileSync(dirPath, csvData, { encoding: 'utf-8', flush: true });
		},
		title: 'infrastructure_stops_v1',
	});

	//
	// Parse the aggregation result into CSV

	for (const foundStop of aggregationResult) {
		//

		//
		// Format the flags from a complex array to a string

		const formattedFlags: string[] = [];

		for (const flag of foundStop.flags) {
			for (const flagAgencyId of flag.agency_ids) {
				formattedFlags.push(`${flagAgencyId}:${flag.stop_id}`);
			}
		}

		//
		// Format the output row

		const outputRow: InfrastructureStopsV1OutputRow = {
			flags: formattedFlags.join('|'),
			legacy_ids: foundStop.legacy_ids.join('|'),
			stop_code: foundStop._id,
			stop_id: foundStop._id,
			stop_lat: foundStop.latitude,
			stop_lon: foundStop.longitude,
			stop_name: foundStop.name,
		};

		const validatedOutputRow = InfrastructureStopsV1OutputRowSchema.parse(outputRow);

		await writer.write(validatedOutputRow);
	}

	await writer.flush();
}
