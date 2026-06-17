/* eslint-disable perfectionist/sort-objects */
/* eslint-disable perfectionist/sort-interfaces */

import { type ExportGtfsContext } from '@/types/context.js';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { type GTFS_Trip_Extended, type Plan } from '@tmlmobilidade/types';
import { getPublicPatternId, getPublicRouteId, getPublicServiceId, getPublicShapeId, getPublicTripId } from '@tmlmobilidade/utils';

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

/**
 * Export the trips.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportTripsFile(planData: Plan, sqlTables: GtfsSQLTables, context: ExportGtfsContext) {
	//

	for await (const tripItem of sqlTables.trips.stream('ORDER BY trip_id ASC')) {
		const tripData: GTFS_Trip_Extended = tripItem;
		const parsedTripsRow: ExportedTripsRow = {
			route_id: getPublicRouteId(planData.gtfs_agency.agency_id, tripData.route_id),
			service_id: getPublicServiceId(planData._id, planData.gtfs_agency.agency_id, tripData.service_id),
			trip_id: getPublicTripId(planData._id, planData.gtfs_agency.agency_id, tripData.trip_id),
			pattern_id: getPublicPatternId(planData.gtfs_agency.agency_id, tripData.pattern_id),
			trip_headsign: tripData.trip_headsign,
			direction_id: tripData.direction_id,
			shape_id: getPublicShapeId(planData._id, planData.gtfs_agency.agency_id, tripData.shape_id),
			wheelchair_accessible: tripData.wheelchair_accessible ?? 0,
			bikes_allowed: tripData.bikes_allowed ?? 0,
			cars_allowed: 0,
			calendar_desc: '',
		};
		await context.writers.trips.write(parsedTripsRow);
	}

	await context.writers.trips.flush();

	Logger.info({ message: 'Exported trip.txt file.' });
}
