/* * */

import { type AggregationPipeline } from '@tmlmobilidade/go-clients-mongo';
import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { locationPermissionMatch } from '@tmlmobilidade/go-interfaces-locationsdb';
import { authProvider } from '@tmlmobilidade/go-providers-auth';
import { type ExtractionTaskContext, type ExtractionTaskResult, type InfrastructureStopsV1Extraction, InfrastructureStopsV1ExtractionPropertiesSchema } from '@tmlmobilidade/go-types-extractions';
import { Stop } from '@tmlmobilidade/go-types-infrastructure';
import { filterPermissionResourceValues, PermissionCatalog } from '@tmlmobilidade/go-types-permissions';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { stringify as csvStringify } from 'csv-stringify/sync';
import fs from 'node:fs';
import path from 'node:path';

import { type InfrastructureStopsV1OutputRow, InfrastructureStopsV1OutputRowSchema } from './types.js';

/**
 * Exports the permitted stops matching the filters to stops.csv.
 * @param context The extraction task context.
 * @param extraction The extraction to run.
 */
export async function extractInfrastructureStopsV1(context: ExtractionTaskContext, extraction: InfrastructureStopsV1Extraction): Promise<ExtractionTaskResult> {
	//

	const validatedProperties = InfrastructureStopsV1ExtractionPropertiesSchema.parse(extraction.properties);

	//
	// Adjust properties to match user permissions

	const userPermissions = await authProvider.getPermissionsFromUserId(extraction.created_by);

	const locationAccess = PermissionCatalog.getPermissionResourceAccess({
		checks: [{ action: PermissionCatalog.all.stops.actions.read, scope: PermissionCatalog.all.stops.scope }],
		permissions: userPermissions,
		resource_key: 'location_ids',
	});

	validatedProperties.agency_ids = filterPermissionResourceValues<string>({
		action: 'read',
		permissions: userPermissions,
		resourceKey: 'agency_ids',
		scope: 'stops',
		values: validatedProperties.agency_ids,
	});

	//
	// Build aggregation pipeline

	const pipeline: AggregationPipeline<Stop> = [
		{
			$match: {
				...(locationAccess.allowAll ? {} : locationPermissionMatch(locationAccess.values)),
				...(validatedProperties.agency_ids?.length ? { 'flags.agency_ids': { $in: validatedProperties.agency_ids ?? [] } } : {}),
				...(validatedProperties.location_primary_ids?.length ? { 'location.primary.osm_id': { $in: validatedProperties.location_primary_ids?.map(Number) ?? [] } } : {}),
				...(validatedProperties.location_secondary_ids?.length ? { 'location.secondary.osm_id': { $in: validatedProperties.location_secondary_ids?.map(Number) ?? [] } } : {}),
				...(validatedProperties.location_tertiary_ids?.length ? { 'location.tertiary.osm_id': { $in: validatedProperties.location_tertiary_ids?.map(Number) ?? [] } } : {}),
			},
		},
		{ $sort: { created_at: -1 } },
	];

	const aggregationResult = await goDb.infrastructure.stops.aggregate(pipeline);

	const fileName = `infrastructure-stops-v1-${extraction._id}.csv`;

	const writer = new BatchWriter({
		batch_size: 100_000,
		insertFn: async (data) => {
			const filePath = path.join(context.output_path, fileName);
			const fileAlreadyExists = fs.existsSync(filePath);
			const csvData = csvStringify(data, { header: !fileAlreadyExists });
			fs.appendFileSync(filePath, csvData, { encoding: 'utf-8', flush: true });
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
