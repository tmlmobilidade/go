/* * */

import { buffer, point } from '@turf/turf';
import { type Feature, type Polygon } from 'geojson';

/**
 * Create a geofence around a given point with a given radius in meters (default is 50 meters).
 * @param latitude
 * @param longitude
 * @param radius (default is 50 meters)
 * @returns The GeoJSON Feature of a Polygon.
 */
export function createGeofence(longitude: number, latitude: number, radius = 50): Feature<Polygon> {
	const firstStopTurfPoint = point([longitude, latitude]);
	return buffer(firstStopTurfPoint, radius, { units: 'meters' }) as Feature<Polygon>;
}
