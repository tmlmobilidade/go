/* * */

import { validateGtfsDate } from '@tmlmobilidade/go-types-gtfs';
import { type GtfsRtFeedEntity, type GtfsRtFeedMessage } from '@tmlmobilidade/go-types-gtfs-rt';
import { type HubVehiclePosition } from '@tmlmobilidade/go-types-hub';
import { Dates } from '@tmlmobilidade/go-utils-dates';

/* * */

/**
 * Converts an array of `HubVehiclePosition` objects to a GTFS-RT feed message.
 *
 * Each position is converted to a valid `GtfsRtFeedEntity`:
 * - Filters out positions without a `ride_id`.
 * - Transforms the position to a valid `GtfsRtFeedEntity` using the appropriate GTFS-RT feed entity schema.
 * - Returns the transformed entity and header.
 *
 * @param positions Array of `HubVehiclePosition` objects to convert.
 * @returns The GTFS-RT feed message containing the transformed entity and header.
 */
export function toGtfsRtVehiclePositions(positions: HubVehiclePosition[]): GtfsRtFeedMessage {
	const entity: GtfsRtFeedEntity[] = positions
		.filter(position => Boolean(position.ride_id))
		.map(position => ({
			id: position._id,
			vehicle: {
				current_status: position.current_status,
				position: {
					bearing: position.bearing,
					latitude: position.latitude,
					longitude: position.longitude,
					speed: position.speed,
				},
				stop_id: position.stop_id,
				timestamp: position.created_at,
				trip: {
					route_id: position.route_id,
					schedule_relationship: 'SCHEDULED',
					start_date: validateGtfsDate(position.operational_date),
					trip_id: position.trip_id,
				},
				vehicle: {
					id: position.vehicle_id,
					wheelchair_accessible: 'UNKNOWN',
				},
			},
		}));

	return {
		entity,
		header: {
			gtfs_realtime_version: '2.0',
			incrementality: 'FULL_DATASET',
			timestamp: Dates.now('Europe/Lisbon').unix_milliseconds,
		},
	};
}
