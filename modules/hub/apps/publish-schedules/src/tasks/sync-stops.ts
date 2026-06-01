/* * */

import { apiCache } from '@tmlmobilidade/databases';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { Timer } from '@tmlmobilidade/timer';
import { type HubStop, HubStopSchema } from '@tmlmobilidade/types';

/* * */

interface QueryResult extends HubStop {
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
	// Fetch all Stops from NETWORKDB

	const allStops = importedGtfsSql.stops.query(`
		SELECT
			s.*,
			r.route_ids,
			r.line_ids,
			r.pattern_ids
		FROM
			stops s
		LEFT JOIN (
			SELECT
				stop_id,
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

	const allStopsData: HubStop[] = [];
	let updatedStopsCounter = 0;

	for (const stop of allStops as QueryResult[]) {
		//

		//
		// Discover which facilities this stop is near to

		// const facilities = [];

		// if (stop.near_health_clinic) facilities.push('health_clinic');
		// if (stop.near_hospital) facilities.push('hospital');
		// if (stop.near_university) facilities.push('university');
		// if (stop.near_school) facilities.push('school');
		// if (stop.near_police_station) facilities.push('police_station');
		// if (stop.near_fire_station) facilities.push('fire_station');
		// if (stop.near_shopping) facilities.push('shopping');
		// if (stop.near_historic_building) facilities.push('historic_building');
		// if (stop.near_transit_office) facilities.push('transit_office');
		// if (stop.subway) facilities.push('subway');
		// if (stop.light_rail) facilities.push('light_rail');
		// if (stop.train) facilities.push('train');
		// if (stop.boat) facilities.push('boat');
		// if (stop.airport) facilities.push('airport');
		// if (stop.bike_sharing) facilities.push('bike_sharing');
		// if (stop.bike_parking) facilities.push('bike_parking');
		// if (stop.car_parking) facilities.push('car_parking');

		//
		// Build the final stop object

		const parsedStop = HubStopSchema.parse(stop);

		allStopsData.push(parsedStop);

		updatedStopsCounter++;

		//
	}

	//
	// Save to the database

	await apiCache.set('hub:network:stops', JSON.stringify(allStopsData));

	Logger.success(`Done updating ${updatedStopsCounter} Stops (${globalTimer.get()})`);

	//
};
