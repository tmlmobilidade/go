/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type GTFS_Stop_Extended, type HubStop, HubStopSchema } from '@tmlmobilidade/types';

/* * */

interface QueryResult extends GTFS_Stop_Extended {
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

	const allStops = importedGtfsSql.stops.query(`
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
				json_group_array(DISTINCT r.agency_id) AS agency_ids,
				json_group_array(DISTINCT r.route_short_name) AS line_ids,
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

	for (const stop of allStops as QueryResult[]) {
		try {
		//

			//
			// Build the final stop object

			const validatedStop: HubStop = {
				_id: Number(stop.stop_id),
				agency_ids: JSON.parse(stop.agency_ids),
				district_id: stop.district_id,
				district_name: stop.district_name,
				flags: [],
				latitude: stop.stop_lat,
				legacy_ids: [],
				lifecycle_status: 'active',
				line_ids: JSON.parse(stop.line_ids),
				locality_id: stop.locality_id,
				locality_name: stop.locality_name,
				longitude: stop.stop_lon,
				municipality_id: stop.municipality_id,
				municipality_name: stop.municipality_name,
				name: stop.stop_name,
				parish_id: stop.parish_id,
				parish_name: stop.parish_name,
				pattern_ids: JSON.parse(stop.pattern_ids),
				route_ids: JSON.parse(stop.route_ids),
				short_name: stop.stop_short_name ?? stop.stop_name,
				tts_name: stop.tts_stop_name,
			};

			const parsedStop = HubStopSchema.parse(validatedStop);

			exportedStopsData.push(parsedStop);

			updatedStopsCounter++;

		//
		} catch (error) {
			Logger.error(`Error processing stop ${stop.stop_id}:`, error);
			continue;
		}
	}

	//
	// Save to the database

	await apiCache.set('hub:network:stops', JSON.stringify(exportedStopsData));

	Logger.success(`Done updating ${updatedStopsCounter} Stops (${globalTimer.get()})`);

	//
};
