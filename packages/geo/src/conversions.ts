/* * */

import { type HashedShape } from '@tmlmobilidade/types';
import { type Feature, type GeoJsonProperties, type LineString, type Point, type Polygon, type Position } from 'geojson';

/**
 * Converts a list of GTFS shape points into a GeoJSON LineString.
 * @param hashedShape The hashed shape containing GTFS shape points.
 * @returns GeoJSON LineString feature
 */
export function toLineStringFromHashedShape(hashedShape: HashedShape): LineString {
	// Exit if no points are provided
	if (!hashedShape.points?.length) return toLineStringFromPositions([]);
	// Sort points by shape_pt_sequence
	const sortedPoints = [...hashedShape.points].sort((a, b) => a.shape_pt_sequence - b.shape_pt_sequence);
	// Create a LineString feature
	const coordinates = sortedPoints.map(p => [Number(p.shape_pt_lon), Number(p.shape_pt_lat)] as [number, number]);
	// Return the LineString feature
	return toLineStringFromPositions(coordinates);
}

/**
 * Creates a new LineString from the given set of coordinates.
 * @param positions An array of coordinate positions for the LineString. Defaults to an empty array.
 * @returns A GeoJSON LineString with the specified coordinates.
 */
export function toLineStringFromPositions(positions: Position[] = []): LineString {
	return {
		coordinates: positions,
		type: 'LineString',
	};
}

/**
 * Creates a new Point from the given coordinates.
 * @param position A coordinate position for the Point. Defaults to an empty array.
 * @returns A GeoJSON Point with the specified coordinates.
 */
export function toPointFromPositions(position: Position = []): Point {
	return {
		coordinates: position,
		type: 'Point',
	};
}

/**
 * Creates a new Feature from the given object and properties.
 * @param object The object to convert to a Feature. Can be a LineString, Point, or Polygon.
 * @param properties Optional properties to attach to the Feature. Defaults to an empty object.
 * @returns A GeoJSON Feature with the specified object and properties.
 */
export function toFeatureFromObject<T extends LineString | Point | Polygon>(object: T, properties?: GeoJsonProperties): Feature<T> {
	return {
		geometry: object,
		properties: properties || {},
		type: 'Feature',
	};
}

/**
 * Converts a value in kilometers or meters to meters based on a ballpark value.
 * If the ballpark value is greater than 800 meters, it assumes the value is in meters.
 * Otherwise, it assumes the value is in kilometers and converts it to meters.
 * @param value The value to be converted, which can be a number or a string that can be converted to a number.
 * @param ballpark The ballpark value to determine the unit of the value, which can also be a number or a string that can be converted to a number.
 * @returns The converted value in meters.
 */
export function toMetersFromKilometersOrMeters(value: number | string, ballpark: number | string): number {
	//

	const ballparkThreshold = 800; // meters

	const valueAsNumber = Number(value);
	const ballparkAsNumber = Number(ballpark);

	if (Number.isNaN(valueAsNumber)) throw new Error('Value must be a number or a string that can be converted to a number.');
	if (Number.isNaN(ballparkAsNumber)) throw new Error('Ballpark must be a number or a string that can be converted to a number.');

	// If the ballpark is bigger than 800, then the value is in meters
	// Otherwise, the value is in kilometers. This is because it is unlikely
	// that a trip will be smaller than 800 meters, and longer than 800 kilometers.

	if (ballparkAsNumber > ballparkThreshold) {
		return valueAsNumber;
	}

	return valueAsNumber * 1000;

	//
};
