/* * */

import type { Stop as GtfsStopsExtended } from '@tmlmobilidade/go-hub-pckg-types';

import { getGtfsSqliteContext } from '@/modules/gtfsSqlite.js';
import LOGGER from '@helperkits/logger';
import TIMETRACKER from '@helperkits/timer';
import { SERVERDB } from '@tmlmobilidade/go-hub-pckg-services/SERVERDB';
import { SERVERDB_KEYS } from '@tmlmobilidade/go-hub-pckg-settings';
import { NetworkStop, StopOperationalStatus } from '@tmlmobilidade/go-hub-pckg-types';
import { sortCollator } from '@tmlmobilidade/go-hub-pckg-utils';

/* * */

interface QueryResult extends GtfsStopsExtended {
	line_ids: null | string
	pattern_ids: null | string
	route_ids: null | string
}

/* * */

export const syncStops = async () => {
	//

	LOGGER.title(`Sync Stops`);
	const globalTimer = new TIMETRACKER();

	//
	// Fetch all Stops from NETWORKDB

	const { db } = getGtfsSqliteContext();
	const allStops = db.prepare(`
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
	`).all() as QueryResult[];

	//
	// For each item, update its entry in the database

	const allStopsData: NetworkStop[] = [];
	let updatedStopsCounter = 0;

	for (const stop of allStops) {
		//

		//
		// Discover which facilities this stop is near to

		const facilities = [];

		if (stop.near_health_clinic) facilities.push('health_clinic');
		if (stop.near_hospital) facilities.push('hospital');
		if (stop.near_university) facilities.push('university');
		if (stop.near_school) facilities.push('school');
		if (stop.near_police_station) facilities.push('police_station');
		if (stop.near_fire_station) facilities.push('fire_station');
		if (stop.near_shopping) facilities.push('shopping');
		if (stop.near_historic_building) facilities.push('historic_building');
		if (stop.near_transit_office) facilities.push('transit_office');
		if (stop.subway) facilities.push('subway');
		if (stop.light_rail) facilities.push('light_rail');
		if (stop.train) facilities.push('train');
		if (stop.boat) facilities.push('boat');
		if (stop.airport) facilities.push('airport');
		if (stop.bike_sharing) facilities.push('bike_sharing');
		if (stop.bike_parking) facilities.push('bike_parking');
		if (stop.car_parking) facilities.push('car_parking');

		//
		// Convert stop operational status

		let parsedStopOperationalStatus: StopOperationalStatus | undefined;

		switch (stop.operational_status) {
			case 'ACTIVE':
				parsedStopOperationalStatus = StopOperationalStatus.active;
				break;
			case 'SEASONAL':
				parsedStopOperationalStatus = StopOperationalStatus.seasonal;
				break;
			case 'VOIDED':
				parsedStopOperationalStatus = StopOperationalStatus.voided;
				break;
			default:
				parsedStopOperationalStatus = undefined;
				break;
		}

		//
		// Build the final stop object

		const parsedStop: NetworkStop = {
			district_id: stop.district_id,
			district_name: stop.district_name,
			facilities: facilities || [],
			id: stop.stop_id,
			lat: Number(stop.stop_lat),
			line_ids: stop.line_ids ? JSON.parse(stop.line_ids) : [],
			locality_id: stop.locality_id,
			locality_name: stop.locality_name,
			lon: Number(stop.stop_lon),
			long_name: stop.stop_name,
			municipality_id: stop.municipality_id,
			municipality_name: stop.municipality_name,
			operational_status: parsedStopOperationalStatus,
			parish_id: stop.parish_id,
			parish_name: stop.parish_name,
			pattern_ids: stop.pattern_ids ? JSON.parse(stop.pattern_ids) : [],
			route_ids: stop.route_ids ? JSON.parse(stop.route_ids) : [],
			short_name: stop.stop_short_name,
			tts_name: stop.tts_stop_name,
			wheelchair_boarding: stop.wheelchair_boarding === 1,
		};

		allStopsData.push(parsedStop);

		updatedStopsCounter++;

		//
	}

	//
	// Save to the database

	allStopsData.sort((a, b) => sortCollator.compare(a.id, b.id));
	await SERVERDB.set(SERVERDB_KEYS.NETWORK.STOPS, JSON.stringify(allStopsData));

	LOGGER.success(`Done updating ${updatedStopsCounter} Stops (${globalTimer.get()})`);

	//
};
