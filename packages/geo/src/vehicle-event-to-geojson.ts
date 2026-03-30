/* * */

import { SimplifiedVehicleEvent, Vehicle } from '@tmlmobilidade/types';

/* * */

/**
 * Converts a SimplifiedVehicleEvent object into a GeoJSON Feature of type Point.
 *
 * @param vehiclePositionData - Object containing vehicle position and metadata.
 * @returns A GeoJSON Feature representing the vehicle's geographic location and associated properties.
 *
 * Properties embedded in the feature:
 * - agency_id: ID of the agency the vehicle belongs to
 * - bearing:   Heading in degrees
 * - id:        Vehicle identifier (duplicated for GeoJSON "properties.id" key)
 * - lat:       Vehicle latitude
 * - lon:       Vehicle longitude
 * - trip_id:   Associated trip identifier
 */
export function transformVehicleDataIntoGeoJsonFeature(event: SimplifiedVehicleEvent, vehicleData?: Vehicle): GeoJSON.Feature<GeoJSON.Point> {
	return {
		geometry: {
			coordinates: [event.longitude, event.latitude],
			type: 'Point',
		},
		id: event.vehicle_id,
		properties: {
			...(vehicleData ?? {}),
			...event,
		},
		type: 'Feature',
	};
}
