/* * */

import { decodeStopFlags } from '@tmlmobilidade/go-hub-pckg-utils';
import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubV1ApiStop, HubV1ApiStopSchema, type HubV1GtfsStops } from '@tmlmobilidade/go-types-hub';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface QueryResult extends HubV1GtfsStops {
	agency_ids: string
	route_ids: string
	route_short_names: string
	shape_ids: string
}

/* * */

export async function generateStops(importedGtfsSql: GtfsSQLTables) {
	//

	Logger.title(`Sync Stops`);
	const globalTimer = new Timer();

	//
	// Aggregate stops with their associated routes, lines and shapes
	// from the imported GTFS database

	const allGtfsStops = importedGtfsSql.stops.query<QueryResult>(`
		SELECT
			s.*,
			r.agency_ids,
			r.route_short_names,
			r.route_ids,
			r.shape_ids
		FROM
			stops s
		LEFT JOIN (
			SELECT
				stop_id,
				json_group_array(DISTINCT r.agency_id) AS agency_ids,
				json_group_array(DISTINCT r.route_id) AS route_ids,
				json_group_array(DISTINCT r.route_short_name) AS route_short_names,
				json_group_array(DISTINCT t.shape_id) AS shape_ids
			FROM
				stop_times st
			JOIN
				trips t ON st.trip_id = t.trip_id
			JOIN
				routes r ON t.route_id = r.route_id
			GROUP BY
				stop_id
		) r ON s.stop_id = r.stop_id;
	`);

	//
	// For each item, update its entry in the database

	const exportedStopsData: HubV1ApiStop[] = [];
	let updatedStopsCounter = 0;

	for (const gtfsStop of allGtfsStops) {
		try {
			//

			if (!gtfsStop.agency_ids?.length) {
				console.error(`Skip processing: stop ${gtfsStop.stop_id} has no agency IDs.`);
				continue;
			}

			if (!gtfsStop.route_short_names?.length) {
				console.error(`Skip processing: stop ${gtfsStop.stop_id} has no line IDs.`);
				continue;
			}

			if (!gtfsStop.route_ids?.length) {
				console.error(`Skip processing: stop ${gtfsStop.stop_id} has no route IDs.`);
				continue;
			}

			if (!gtfsStop.shape_ids?.length) {
				console.error(`Skip processing: stop ${gtfsStop.stop_id} has no shape IDs.`);
				continue;
			}

			//
			// Parse the flags object

			const decodedFlags = decodeStopFlags(gtfsStop.flags);

			//
			// Build the final stop object

			const validatedStop: HubV1ApiStop = {
				_id: gtfsStop.stop_id,
				agency_ids: JSON.parse(gtfsStop.agency_ids),
				district_id: gtfsStop.district_id,
				district_name: gtfsStop.district_name,
				flags: decodedFlags,
				latitude: gtfsStop.stop_lat,
				legacy_ids: gtfsStop.legacy_ids ? JSON.parse(gtfsStop.legacy_ids) : [],
				lifecycle_status: gtfsStop.lifecycle_status,
				line_ids: JSON.parse(gtfsStop.route_short_names),
				locality_id: gtfsStop.locality_id,
				locality_name: gtfsStop.locality_name,
				longitude: gtfsStop.stop_lon,
				municipality_id: gtfsStop.municipality_id,
				municipality_name: gtfsStop.municipality_name,
				name: gtfsStop.stop_name,
				parish_id: gtfsStop.parish_id,
				parish_name: gtfsStop.parish_name,
				pattern_ids: JSON.parse(gtfsStop.shape_ids),
				route_ids: JSON.parse(gtfsStop.route_ids),
				short_name: gtfsStop.stop_name,
				tts_name: gtfsStop.tts_stop_name,
			};

			const parsedStop = HubV1ApiStopSchema.parse(validatedStop);

			exportedStopsData.push(parsedStop);

			updatedStopsCounter++;

			//
		} catch (error) {
			console.error(`Error processing stop ${gtfsStop.stop_id}:`, error);
			console.log(gtfsStop);
			continue;
		}
	}

	//
	// Save to the database

	await cacheDb.set('hub:v1:network:stops', JSON.stringify(exportedStopsData));

	Logger.success(`Done updating ${updatedStopsCounter} Stops (${globalTimer.get()})`);
};
