/* * */

import { cacheDb } from '@tmlmobilidade/go-interfaces-cachedb';
import { type HubGtfsExportStops, type HubStop, HubStopSchema } from '@tmlmobilidade/go-types-public-info';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';

/* * */

interface QueryResult extends HubGtfsExportStops {
	agency_ids: string
	line_ids: string
	pattern_ids: string
	route_ids: string
}

/* * */

export async function generateStops(importedGtfsSql: GtfsSQLTables) {
	//

	Logger.title(`Sync Stops`);
	const globalTimer = new Timer();

	//
	// Aggregate stops with their associated routes, lines and patterns
	// from the imported GTFS database

	const allGtfsStops = importedGtfsSql.stops.query(`
		SELECT
			s.*,
			r.agency_ids,
			r.line_ids,
			r.route_ids,
			r.pattern_ids
		FROM
			stops s
		LEFT JOIN (
			SELECT
				stop_id,
				flags,
				json_group_array(DISTINCT r.agency_id) AS agency_ids,
				json_group_array(DISTINCT r.line_id) AS line_ids,
				json_group_array(DISTINCT r.route_id) AS route_ids,
				json_group_array(DISTINCT t.pattern_id) AS pattern_ids
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

	const exportedStopsData: HubStop[] = [];
	let updatedStopsCounter = 0;

	for (const gtfsStop of allGtfsStops as QueryResult[]) {
		try {
			//

			if (!gtfsStop.agency_ids?.length) {
				Logger.error({ message: `Skip processing: stop ${gtfsStop.stop_id} has no agency IDs.` });
				continue;
			}

			if (!gtfsStop.line_ids?.length) {
				Logger.error({ message: `Skip processing: stop ${gtfsStop.stop_id} has no line IDs.` });
				continue;
			}

			if (!gtfsStop.route_ids?.length) {
				Logger.error({ message: `Skip processing: stop ${gtfsStop.stop_id} has no route IDs.` });
				continue;
			}

			if (!gtfsStop.pattern_ids?.length) {
				Logger.error({ message: `Skip processing: stop ${gtfsStop.stop_id} has no pattern IDs.` });
				continue;
			}

			//
			// Build the final stop object

			const validatedStop: HubStop = {
				_id: Number(gtfsStop.stop_id),
				agency_ids: JSON.parse(gtfsStop.agency_ids),
				district_id: gtfsStop.district_id,
				district_name: gtfsStop.district_name,
				flags: JSON.parse(gtfsStop.flags),
				latitude: gtfsStop.stop_lat,
				legacy_ids: JSON.parse(gtfsStop.legacy_ids),
				lifecycle_status: 'active',
				line_ids: JSON.parse(gtfsStop.line_ids),
				locality_id: gtfsStop.locality_id,
				locality_name: gtfsStop.locality_name,
				longitude: gtfsStop.stop_lon,
				municipality_id: gtfsStop.municipality_id,
				municipality_name: gtfsStop.municipality_name,
				name: gtfsStop.stop_name,
				parish_id: gtfsStop.parish_id,
				parish_name: gtfsStop.parish_name,
				pattern_ids: JSON.parse(gtfsStop.pattern_ids),
				route_ids: JSON.parse(gtfsStop.route_ids),
				short_name: gtfsStop.stop_short_name ?? gtfsStop.stop_name,
				tts_name: gtfsStop.tts_stop_name,
			};

			const parsedStop = HubStopSchema.parse(validatedStop);

			exportedStopsData.push(parsedStop);

			updatedStopsCounter++;

			//
		} catch (error) {
			Logger.error({ error, message: `Error processing stop ${gtfsStop.stop_id}:` });
			console.log(gtfsStop);
			continue;
		}
	}

	//
	// Save to the database

	await cacheDb.set('hub:v1:network:stops', JSON.stringify(exportedStopsData));

	Logger.success(`Done updating ${updatedStopsCounter} Stops (${globalTimer.get()})`);

	//
};
