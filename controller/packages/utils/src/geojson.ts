/* * */

import * as turf from '@turf/turf';

import { getGeoJsonPointFromAny } from './geojson/get-geojson-point-from-any.js';

/* * */

/**
 * This function takes a GeoJSON LineString and splits it into equal chunks of a given precision
 * using turf.lineChunk. This is useful to ensure greater precision when calculating the nearest
 * point on a path, as some paths may have very long "straight" segments with only two points.
 * @param line A GeoJSON LineString to be split into equal chunks.
 * @param precision The precision used to split the line into equal chunks. Default is 10 meters.
 * @returns A GeoJSON LineString with the split chunks.
 */
export function getLineSplitIntoEqualChunks(line: GeoJSON.Feature<GeoJSON.LineString>, precision = 10): GeoJSON.Feature<GeoJSON.LineString> {
	// Chunk the line into equally spaced points
	const chunkedLineFC = turf.lineChunk(line, precision, { units: 'meters' });
	// Verify if the chunking was successful
	if (!chunkedLineFC.features.length) {
		throw new Error('Error @ getLineSplitIntoEqualChunks: No chunks produced for the given line.');
	}
	// Concatenate all the chunks into a single LineString
	// and clean the coordinates to remove duplicates and invalid points
	const concatenatedChunks = chunkedLineFC.features.flatMap(f => f.geometry.coordinates);
	const concatenatedChunksLineString = turf.lineString(concatenatedChunks);
	const chunkedLine = turf.cleanCoords(concatenatedChunksLineString) as GeoJSON.Feature<GeoJSON.LineString>;
	// Verify if the chunking was successful
	if (!chunkedLine) {
		throw new Error('Error creating chunked line');
	}

	return chunkedLine;
}

/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
/* * */
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
export function getGeofenceOnPath(path: GeoJSON.Feature<GeoJSON.LineString>, point: GeoJSON.Feature<GeoJSON.Point> | GeoJSON.Point | GeoJSON.Position, options?: CalculateGeofenceOnPathOptions): GeoJSON.Feature<GeoJSON.Polygon> {
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
	// Detect the nearest point on the path to the given point.

	const centerPoint = getGeoJsonPointFromAny(point);
	const chunkedLine = getLineSplitIntoEqualChunks(path, configurationValues.chunk_precision);

	const startingPoint = turf.nearestPointOnLine(chunkedLine, centerPoint, { units: 'meters' });

	if (!startingPoint) {
		throw new Error('Error calculating nearest point on path');
	}

	//
	// Since we intend to calculate the geofence backwards and forwards from the stop point,
	// it is necessary to split the path at the starting point. This will result in two LineStrings:
	// 1. The first one is the path from the start of the path to the starting point.
	// 2. The second one is the path from the starting point to the end of the path.

	const splitPath = turf.lineSplit(chunkedLine, startingPoint);

	let mergedParts: GeoJSON.Position[] = [];

	//
	// Now, with the original path split into two parts, we cut each part
	// at the given distance backwards and forwards from the starting point.
	// For the backward split, to accomodate Turf's requirement of only going forward,
	// the starting point is the total length of the part minus the distance,
	// effectively going backwards.

	if (splitPath.features.length > 0 && configurationValues.meters_backward > 0) {
		const backwardLength = turf.length(splitPath.features[0], { units: 'meters' });
		const startingPointDistance = backwardLength - configurationValues.meters_backward;
		if (startingPointDistance > 0) {
			const backwardSplit = turf.lineSliceAlong(splitPath.features[0], startingPointDistance, backwardLength, { units: 'meters' });
			mergedParts = [...mergedParts, ...backwardSplit.geometry.coordinates];
		}
	}

	//

	if (splitPath.features.length > 1 && configurationValues.meters_forward > 0) {
		const forwardSplit = turf.lineSliceAlong(splitPath.features[1], 0, configurationValues.meters_forward, { units: 'meters' });
		mergedParts = [...mergedParts, ...forwardSplit.geometry.coordinates];
	}

	//
	// With both parts cut, we can merge them into a single LineString

	if (!mergedParts.length) {
		throw new Error('Error merging path');
	}

	//
	// Finally, we can create a buffer around the merged path. This will be the geofence.

	const mergedPartsLineString = turf.lineString(mergedParts);

	const geofence = turf.buffer(mergedPartsLineString, 20, { units: 'meters' });

	if (!geofence || geofence?.geometry.type !== 'Polygon') {
		throw new Error('Error creating geofence');
	}

	return geofence as GeoJSON.Feature<GeoJSON.Polygon>;

	//
}
