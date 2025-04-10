/* * */

import { HashedShape } from '@tmlmobilidade/types';
import * as turf from '@turf/turf';
import { type Feature, type LineString, type Point, type Polygon } from 'geojson';

/* * */

const EARTH_RADIUS = 6_371_000; // Earth's radius in meters
const METERS_PER_DEGREE = 111_320; // Approximate meters per degree

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
 * Converts a list of GTFS shape points into a GeoJSON LineString feature.
 * @param points Array of GTFS shape points
 * @returns GeoJSON LineString feature
 */
export function getLineStringFromGtfsShape(points: HashedShape['points']): Feature<LineString> {
	// Exit if no points are provided
	if (!points.length) throw new Error('GTFS shape is empty');
	// Sort points by shape_pt_sequence
	const sortedPoints = [...points].sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
	// Create a LineString feature
	const coordinates = sortedPoints.map(p => [Number(p.shape_pt_lon), Number(p.shape_pt_lat)] as [number, number]);
	// Create the GeoJSON LineString feature
	const lineString = turf.lineString(coordinates);
	// Return the LineString feature
	return lineString;
}

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
 * @param point A GeoJSON Point representation of the point to create the geofence around.
 * @param radius The distance in meters to calculate the geofence radius. Default is 50 meters.
 * @param steps The number of steps to use for the buffer. Default is 16.
 * @returns The GeoJSON Feature of a Polygon.
 */
export function getGeofenceOnPoint(point: Feature<Point>, radius = 50, steps = 16): Feature<Polygon> {
	// Extract the center coordinates from the point
	const [centerLon, centerLat] = point.geometry.coordinates;
	// Set the angle size based on the number of steps
	const angleStep = (2 * Math.PI) / steps;
	// Set an empty array to hold the coordinates of the polygon vertices
	const coords: [number, number][] = [];
	// Calculate the coordinates of the polygon vertices
	for (let i = 0; i < steps; i++) {
		const angle = i * angleStep;
		const dx = radius * Math.cos(angle);
		const dy = radius * Math.sin(angle);
		const newLat = centerLat + (dy / EARTH_RADIUS) * (180 / Math.PI);
		const newLng = centerLon + (dx / (EARTH_RADIUS * Math.cos((centerLat * Math.PI) / 180))) * (180 / Math.PI);
		coords.push([newLng, newLat]);
	}
	// Close the polygon by adding the first coordinate to the end
	coords.push(coords[0]);
	// Create the GeoJSON Polygon feature
	const polygon = turf.polygon([coords]);
	// Return the polygon feature
	return polygon;
}

/* * */

/**
 * Creates a fast approximate buffer around a LineString by offsetting segments to both sides.
 * This is a simplified approach, not suitable for high-precision or large-scale coordinates.
 * @param line A GeoJSON LineString feature representing the path.
 * @param radius The buffer distance in meters. Default is 50 meters.
 * @returns A GeoJSON Polygon feature representing the tube-like buffer around the line.
 */
export function getGeofenceOnLine(line: Feature<LineString>, radius = 50): Feature<Polygon> {
	// Extract the coordinates from the LineString
	const lineCoordinates = line.geometry.coordinates;
	// Exit if the line has less than 2 points
	if (lineCoordinates.length < 2) throw new Error('LineString must have at least 2 points.');
	// Initialize arrays to hold the offset points
	const leftOffsetPoints: [number, number][] = [];
	const rightOffsetPoints: [number, number][] = [];
	// Loop through each segment of the line
	// to calculate offset points for both sides
	for (let i = 0; i < lineCoordinates.length - 1; i++) {
		// Get the coordinates of the current and next point
		const [lngStart, latStart] = lineCoordinates[i];
		const [lngEnd, latEnd] = lineCoordinates[i + 1];
		// Calculate the differences in longitude and latitude between the two points
		const deltaLng = lngEnd - lngStart;
		const deltaLat = latEnd - latStart;
		// Calculate the average latitude and convert degrees to radians
		// to get the meters per degree for longitude
		const averageLatitude = (latStart + latEnd) / 2;
		const metersPerDegreeLng = METERS_PER_DEGREE * Math.cos((averageLatitude * Math.PI) / 180);
		const metersPerDegreeLat = METERS_PER_DEGREE;
		// Calculate the perpendicular (normal) vector to the segment
		const segmentLength = Math.sqrt(deltaLng * deltaLng + deltaLat * deltaLat);
		const unitNormalX = -deltaLat / segmentLength;
		const unitNormalY = deltaLng / segmentLength;
		// Calculate the offsets in longitude and latitude using
		// the meters per degree conversion and the radius of the buffer
		const offsetLng = (unitNormalX * radius) / metersPerDegreeLng;
		const offsetLat = (unitNormalY * radius) / metersPerDegreeLat;
		// Push offset coordinates for left and right sides of the line
		leftOffsetPoints.push([lngStart + offsetLng, latStart + offsetLat]);
		rightOffsetPoints.push([lngStart - offsetLng, latStart - offsetLat]);
		// For the last segment (last 2 points),
		// add the end point with the same offsets
		if (i === lineCoordinates.length - 2) {
			leftOffsetPoints.push([lngEnd + offsetLng, latEnd + offsetLat]);
			rightOffsetPoints.push([lngEnd - offsetLng, latEnd - offsetLat]);
		}
	}
	// Close the polygon ring by combining left and reversed right side
	const polygonRing: [number, number][] = [
		...leftOffsetPoints,
		...rightOffsetPoints.reverse(),
		leftOffsetPoints[0], // close the ring
	];
	// Create the GeoJSON Polygon feature
	const polygon = turf.polygon([polygonRing]);
	// Return the polygon feature
	return polygon;
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
