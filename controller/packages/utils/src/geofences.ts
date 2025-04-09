/* * */

import * as turf from '@turf/turf';

/* * */

export function getGeoJsonPointFromAny(point: GeoJSON.Feature<GeoJSON.Point> | GeoJSON.Point | GeoJSON.Position): GeoJSON.Feature<GeoJSON.Point> {
	// If the point is a Position
	if (Array.isArray(point) && point.length === 2) {
		return turf.point(point) as GeoJSON.Feature<GeoJSON.Point>;
	}
	// If the point is a GeoJSON.Point
	if (!Array.isArray(point) && point.type === 'Point') {
		return turf.feature(point);
	}
	// If the point is a GeoJSON.Feature<GeoJSON.Point>
	if (!Array.isArray(point) && point.type === 'Feature' && point.geometry.type === 'Point') {
		return point;
	}
	// Throw if invalid point type
	throw new Error('Invalid point type');
}

/* * */

/**
 * Check if a given point is inside a given geofence.
 * @param point A GeoJSON.Point representation of the point to check.
 * @param geofence A GeoJSON.Polygon representation of the geofence.
 * @returns A boolean indicating if the point is inside the geofence.
 */
export function isInsideGeofence(point: GeoJSON.Feature<GeoJSON.Point> | GeoJSON.Point | GeoJSON.Position, geofence: GeoJSON.Feature<GeoJSON.Polygon>): boolean {
	return turf.booleanPointInPolygon(point, geofence);
}

/* * */

/**
 * Create a geofence around a given point with a given radius in meters (default is 50 meters).
 * @param latitude
 * @param longitude
 * @param radius (default is 50 meters)
 * @returns The GeoJSON Feature of a Polygon.
 */
export function getGeofenceOnPoint(point: GeoJSON.Feature<GeoJSON.Point> | GeoJSON.Point | GeoJSON.Position, radius = 50): GeoJSON.Feature<GeoJSON.Polygon> {
	//

	const centerPoint = getGeoJsonPointFromAny(point);

	const geofence = turf.buffer(centerPoint, radius, { units: 'meters' });

	if (!geofence || geofence.geometry.type !== 'Polygon') {
		throw new Error('Error creating geofence');
	}

	return geofence as GeoJSON.Feature<GeoJSON.Polygon>;

	//
}

/* * */

interface CalculateGeofenceOnPathOptions {

	/**
	 * Precision used to calculate the nearest point on the path to the given point, in meters.
	 * @default 10 meters
	 */
	chunk_precision?: number

	/**
	 * The distance in meters to calculate the geofence radius.
	 * @default 50 meters
	 */
	geofence_radius?: number

	/**
	 * The distance in meters to calculate the geofence backwards from the stop point.
	 * @default 50 meters
	 */
	meters_backward?: number

	/**
	 * The distance in meters to calculate the geofence forwards from the stop point.
	 * @default 50 meters
	 */
	meters_forward?: number

}

/**
 * From a given LineString (shape) and a Point (stop), this function calculates
 * a geofence (GeoJSON.Polygon) on the path of the shape, from a given distance forwards and backwards
 * from the stop point. If the stop point is not on top of the shape, an intersection
 * on the shape is calculated and the geofence is calculated from that point.
 * @param path A GeoJSON.LineString representation of the path.
 * @param point A GeoJSON.Point representation of the reference point of the geofence.
 * @param options An object containing the options for the geofence calculation.
 * @param options.meters_forward The distance in meters to calculate the geofence forwards from the stop point.
 * @param options.meters_backward The distance in meters to calculate the geofence backwards from the stop point.
 * @param options.chunk_precision The precision used to calculate the nearest point on the path to the given point.
 * @returns A GeoJSON.Polygon feature representation of the geofence.
 */
export function getGeofenceOnPath(path: GeoJSON.Feature<GeoJSON.LineString> | GeoJSON.LineString, point: GeoJSON.Feature<GeoJSON.Point> | GeoJSON.Point | GeoJSON.Position, options?: CalculateGeofenceOnPathOptions): GeoJSON.Feature<GeoJSON.Polygon> {
	//

	//
	// Setup the configuration values for the geofence calculation.

	const configurationValues = {
		chunk_precision: options?.chunk_precision || 10,
		geofence_radius: options?.geofence_radius || 50,
		meters_backward: options?.meters_backward || 50,
		meters_forward: options?.meters_forward || 50,
	};

	//
	// Divide the shape into chunks of 10 meters. This is necessary to calculate
	// the nearest point on the path to the given point with enough precision.
	// Some shapes have are very long "straight" segments with only two points, and the nearest point
	// on the path to the given point in these cases can be very far from the given point.
	// The chunking is done using turf.lineChunk, which creates a new LineString with
	// a number of points equal to the distance between the points in the original LineString.
	// Then, it is necessary to merge all the points into a single LineString again.

	const chunkedLineFC = turf.lineChunk(path, configurationValues.chunk_precision || 10, { units: 'meters' });

	if (!chunkedLineFC.features || chunkedLineFC.features.length === 0) {
		throw new Error('Error chunking path');
	}

	const coordinates: GeoJSON.Position[] = [];
	chunkedLineFC.features.forEach(feature => coordinates.push(...feature.geometry.coordinates));

	const chunkedLine = turf.lineString(coordinates);

	if (!chunkedLine) {
		throw new Error('Error creating chunked line');
	}

	//
	// With the equally spaced points, we can calculate the nearest point
	// on the path to the given point. This is the starting point of the geofence.

	const startingPoint = turf.nearestPointOnLine(chunkedLine, point);

	if (!startingPoint) {
		throw new Error('Error calculating nearest point on path');
	}

	//
	// Since we intend to calculate the geofence backwards and forwards from the stop point,
	// it is necessary to split the path at the starting point. This will result in two LineStrings:
	// 1. The first one is the path from the start of the path to the starting point.
	// 2. The second one is the path from the starting point to the end of the path.

	const splitPath = turf.lineSplit(chunkedLine, startingPoint);

	if (!splitPath.features || splitPath.features.length < 2) {
		throw new Error('Error splitting path');
	}

	//
	// Now, with the original path split into two parts, we cut each part
	// at the given distance backwards and forwards from the starting point.
	// For the backward split, to accomodate Turf's requirement of only going forward,
	// the starting point is the total length of the part minus the distance,
	// effectively going backwards.

	const backwardDistance = turf.length(splitPath.features[0], { units: 'meters' });
	const backwardSplit = turf.lineSliceAlong(splitPath.features[0], backwardDistance - configurationValues.meters_backward, backwardDistance, { units: 'meters' });

	const forwardSplit = turf.lineSliceAlong(splitPath.features[1], 0, configurationValues.meters_forward, { units: 'meters' });

	//
	// With both parts cut, we can merge them into a single LineString

	const mergedParts = turf.lineString([...backwardSplit.geometry.coordinates, ...forwardSplit.geometry.coordinates]);

	if (!mergedParts) {
		throw new Error('Error merging path');
	}

	//
	// Finally, we can create a buffer around the merged path. This will be the geofence.

	const geofence = turf.buffer(mergedParts, 20, { units: 'meters' });

	if (!geofence || geofence.geometry.type !== 'Polygon') {
		throw new Error('Error creating geofence');
	}

	return geofence as GeoJSON.Feature<GeoJSON.Polygon>;

	//
}
