/* * */

import { METERS_PER_DEGREE } from '@/geojson/constants.js';
import { polygon } from '@turf/helpers';
import { type Feature, type LineString, type Polygon } from 'geojson';

import { getPolygon } from './get-polygon.js';

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
	if (lineCoordinates.length < 2) return getPolygon();
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
	// Return the polygon feature
	return polygon([polygonRing]);
}
