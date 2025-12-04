/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type MergedGtfsExportConfig } from '@/types.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Trip_Extended, type Plan } from '@tmlmobilidade/types';

/* * */

export interface ExportedTripsRow {
	route_id: string
	service_id: string
	trip_id: string
	pattern_id: string
	trip_headsign: string
	direction_id: 0 | 1
	shape_id: string
	wheelchair_accessible: 0 | 1 | 2
	bikes_allowed: 0 | 1 | 2
	cars_allowed: 0 | 1 | 2
	calendar_desc: string
}

/* * */

export async function exportTripsRows(planData: Plan, sqlTables: GtfsSQLTables, exportConfig: MergedGtfsExportConfig) {
	//

	for await (const tripItem of sqlTables.trips.stream('ORDER BY trip_id ASC')) {
		const tripData: GTFS_Trip_Extended = tripItem;
		const parsedTripsRow: ExportedTripsRow = {
			route_id: tripData.route_id,
			service_id: `[${planData._id}]${tripData.service_id}`,
			trip_id: `[${planData._id}]${tripData.trip_id}`,
			pattern_id: tripData.pattern_id,
			trip_headsign: tripData.trip_headsign,
			direction_id: tripData.direction_id,
			shape_id: `[${planData._id}]${tripData.shape_id}`,
			wheelchair_accessible: tripData.wheelchair_accessible ?? 0,
			bikes_allowed: tripData.bikes_allowed ?? 0,
			cars_allowed: 0,
			calendar_desc: '',
		};
		await exportConfig.writers.trips.write(parsedTripsRow);
	}

	await exportConfig.writers.trips.flush();

	Logger.info('Exported trip.txt file.');
}
