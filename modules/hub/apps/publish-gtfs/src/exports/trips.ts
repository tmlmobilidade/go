/* * */

import { type ExportGtfsContext } from '@/types/context.js';
import { GtfsTernary, type GtfsTripDirection, GtfsWheelchairBoarding } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsStrictV29Trips } from '@tmlmobilidade/go-types-gtfs-strict';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';
import { getPublicPatternId, getPublicRouteId, getPublicServiceId, getPublicShapeId, getPublicTripId } from '@tmlmobilidade/utils';

/* * */

export interface ExportedTripsRow {
	bikes_allowed: GtfsTernary
	calendar_desc: string
	cars_allowed: GtfsTernary
	direction_id: GtfsTripDirection
	pattern_id: string
	route_id: string
	service_id: string
	shape_id: string
	trip_headsign: string
	trip_id: string
	wheelchair_accessible: GtfsWheelchairBoarding
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
		const tripData: GtfsStrictV29Trips = tripItem;
		const parsedTripsRow: ExportedTripsRow = {
			bikes_allowed: tripData.bikes_allowed ?? '0',
			calendar_desc: '',
			cars_allowed: '0',
			direction_id: tripData.direction_id,
			pattern_id: getPublicPatternId(planData.agency_id, tripData.pattern_id),
			route_id: getPublicRouteId(planData.agency_id, tripData.route_id),
			service_id: getPublicServiceId(planData._id, planData.agency_id, tripData.service_id),
			shape_id: getPublicShapeId(planData._id, planData.agency_id, tripData.shape_id),
			trip_headsign: tripData.trip_headsign,
			trip_id: getPublicTripId(planData._id, planData.agency_id, tripData.trip_id),
			wheelchair_accessible: tripData.wheelchair_accessible ?? '0',
		};
		await context.writers.trips.write(parsedTripsRow);
	}

	await context.writers.trips.flush();

	Logger.info({ message: 'Exported trip.txt file.' });
}
