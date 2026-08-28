/* * */

import { getQualifiedRouteId, getQualifiedServiceId, getQualifiedShapeId, getQualifiedTripId } from '@tmlmobilidade/go-hub-pckg-utils';
import { type GtfsTrips } from '@tmlmobilidade/go-types-gtfs';
import { type HubGtfsExportTrips } from '@tmlmobilidade/go-types-hub';
import { type Plan } from '@tmlmobilidade/go-types-operation';
import { type GtfsSQLTables } from '@tmlmobilidade/import-gtfs';
import { Logger } from '@tmlmobilidade/logger';

import { type ExportGtfsContext } from '../types/context.js';

/**
 * Export the trips.txt file.
 * @param planData The plan data.
 * @param sqlTables The SQL tables.
 * @param context The export context.
 */
export async function exportTripsFile(planData: Plan, sqlTables: GtfsSQLTables, context: ExportGtfsContext) {
	//

	for await (const tripItem of sqlTables.trips.stream('ORDER BY trip_id ASC')) {
		const tripData: GtfsTrips = tripItem;
		const parsedTripsRow: HubGtfsExportTrips = {
			bikes_allowed: tripData.bikes_allowed,
			cars_allowed: tripData.cars_allowed,
			direction_id: tripData.direction_id,
			route_id: getQualifiedRouteId(planData.agency_id, tripData.route_id),
			service_id: getQualifiedServiceId(planData._id, planData.agency_id, tripData.service_id),
			shape_id: getQualifiedShapeId(planData._id, planData.agency_id, tripData.shape_id),
			trip_headsign: tripData.trip_headsign,
			trip_id: getQualifiedTripId(planData._id, planData.agency_id, tripData.trip_id),
			wheelchair_accessible: tripData.wheelchair_accessible,
		};
		await context.writers.trips.write(parsedTripsRow);
	}

	await context.writers.trips.flush();

	Logger.info({ message: 'Exported trip.txt file.' });
}
