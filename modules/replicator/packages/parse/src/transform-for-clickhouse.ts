/* * */

import { Dates } from '@tmlmobilidade/dates';
import { type ClickHouseVehicleEvent, type ExtendedPosition } from '@tmlmobilidade/types';
import h3 from 'h3-js';
import geohash from 'ngeohash';

/* * */

/**
 * Transform a SimplifiedVehicleEvent document for ClickHouse insertion.
 * Flattens the nested position object and handles type conversions.
 */
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function transformVehicleEventForClickHouse(pcgiDoc: any): ClickHouseVehicleEvent {
	const entity = pcgiDoc.content.entity[0];
	const operationalDate = Dates.fromSeconds(entity.vehicle.timestamp).operational_date;
	const hour = Number(
		Dates.fromSeconds(entity.vehicle.timestamp)
			.setZone('Europe/Lisbon', 'rebase_utc')
			.iso.split('T')[1].split(':')[0],
	);

	const h3Position = Object.fromEntries(
		Array.from({ length: 12 }, (_, i) => [
			`h3_${i + 1}`,
			h3.latLngToCell(entity.vehicle.position.latitude, entity.vehicle.position.longitude, i + 1),
		]),
	) as ExtendedPosition['h3'];

	const geohashPosition = Object.fromEntries(
		Array.from({ length: 12 }, (_, i) => [
			`geohash_${i + 1}`,
			geohash.encode(entity.vehicle.position.latitude, entity.vehicle.position.longitude, i + 1),
		]),
	) as ExtendedPosition['geohash'];

	return {
		_id: pcgiDoc._id,
		agency_id: entity.vehicle.agencyId,
		bearing: entity.vehicle.position.bearing,
		created_at: Dates.fromSeconds(entity.vehicle.timestamp).unix_timestamp,
		current_status: entity.vehicle.currentStatus,
		door: entity.vehicle.trigger.door,
		driver_id: entity.vehicle.vehicle.driverId,
		extra_trip_id: entity.vehicle.trip?.extraTripId,
		hour: hour,
		latitude: entity.vehicle.position.latitude,
		longitude: entity.vehicle.position.longitude,
		odometer: entity.vehicle.position.odometer,
		operational_date: operationalDate,
		pattern_id: entity.vehicle.trip?.patternId,
		plan_id: entity.vehicle.operationPlanId,
		received_at: Dates.fromUnixTimestamp(pcgiDoc.millis).unix_timestamp,
		route_id: entity.vehicle.trip?.routeId,
		stop_id: entity.vehicle.stopId,
		trip_id: entity.vehicle.trip?.tripId,
		vehicle_id: entity.vehicle.vehicle._id,
		...h3Position,
		...geohashPosition,
	};
}
