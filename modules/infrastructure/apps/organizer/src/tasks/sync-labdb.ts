/* * */

import { goDb } from '@tmlmobilidade/go-interfaces-godb';
import { labDb } from '@tmlmobilidade/go-interfaces-labdb';
import { type SimplifiedStop, SimplifiedStopSchema, type Stop } from '@tmlmobilidade/go-types-infrastructure';
import { BatchWriter } from '@tmlmobilidade/go-utils-exec';
import { Logger, Timer } from '@tmlmobilidade/go-utils-telemetry';

/**
 * Syncs the LabDB table with the GoDB collection.
 */
export async function syncLabdbTask() {
	//

	const timer = new Timer();

	//
	// Drop the table

	Logger.info('Dropping table infrastructure.simplified_stops');

	await labDb.queryFromString(`DROP TABLE IF EXISTS infrastructure.simplified_stops`);

	//
	// Recreate the table

	Logger.info('Recreating table infrastructure.simplified_stops');

	await labDb.infrastructure.simplifiedStops.init();

	//
	// Setup a batch writer instance

	const writer = new BatchWriter<SimplifiedStop>({
		batch_size: 5_000,
		insertFn: async (values) => {
			await labDb.infrastructure.simplifiedStops.insert('JSONEachRow', values);
		},
		title: await labDb.infrastructure.simplifiedStops.getTableName(),
	});

	//
	// Copy the data from the GoDB collection to the LabDB table

	Logger.info('Copying data from GoDB collection to LabDB table');

	const stopsCollection = await goDb.infrastructure.stops.getCollection();

	const stopsStream = stopsCollection.find().stream();

	for await (const stopItem of stopsStream) {
		//

		const stopData = stopItem as Stop;

		const simplifiedStopItem: SimplifiedStop = {
			_id: stopData._id,
			created_at: stopData.created_at,
			is_deleted: stopData.is_deleted,
			latitude: stopData.latitude,
			legacy_ids: stopData.legacy_ids,
			lifecycle_status: stopData.lifecycle_status,
			location_country_admin_level: stopData.location.country.admin_level,
			location_country_name: stopData.location.country.name,
			location_country_osm_id: stopData.location.country.osm_id,
			location_neighbourhood_admin_level: stopData.location.neighbourhood?.admin_level ?? null,
			location_neighbourhood_name: stopData.location.neighbourhood?.name ?? null,
			location_neighbourhood_osm_id: stopData.location.neighbourhood?.osm_id ?? null,
			location_primary_admin_level: stopData.location.primary.admin_level,
			location_primary_code: stopData.location.primary.code ?? null,
			location_primary_name: stopData.location.primary.name,
			location_primary_osm_id: stopData.location.primary.osm_id,
			location_secondary_admin_level: stopData.location.secondary.admin_level,
			location_secondary_code: stopData.location.secondary.code ?? null,
			location_secondary_name: stopData.location.secondary.name,
			location_secondary_osm_id: stopData.location.secondary.osm_id,
			location_tertiary_admin_level: stopData.location.tertiary?.admin_level ?? null,
			location_tertiary_code: stopData.location.tertiary?.code ?? null,
			location_tertiary_name: stopData.location.tertiary?.name ?? null,
			location_tertiary_osm_id: stopData.location.tertiary?.osm_id ?? null,
			longitude: stopData.longitude,
			name: stopData.name,
			short_name: stopData.short_name,
			updated_at: stopData.updated_at,
		};

		const parsedItem = SimplifiedStopSchema.parse(simplifiedStopItem);

		await writer.write(parsedItem);
	}

	await writer.flush();

	Logger.info({ message: `LabDB synced in ${timer.get()}` });
}
